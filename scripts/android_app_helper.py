import argparse
import json
import os
import re
import subprocess
import threading
import time
import traceback
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 18768
DEFAULT_APPIUM_URL = "http://127.0.0.1:4723"
DEFAULT_GOPAY_APP_PACKAGE = "com.gojek.gopay"
DEFAULT_GOPAY_APP_ACTIVITY = ""
REQUEST_TIMEOUT_SECONDS = 15
APPROVE_TIMEOUT_SECONDS = 120
POLL_INTERVAL_SECONDS = 2
BASE_DIR = Path(__file__).resolve().parents[1]
SNAPSHOT_DIR = BASE_DIR / "data" / "android-snapshots"
ACTION_RESOURCE_IDS = [
    "com.gojek.gopay:id/btn_pay",
    "com.gojek.gopay:id/button_pay",
    "com.gojek.gopay:id/btn_confirm",
    "com.gojek.gopay:id/button_confirm",
    "com.gojek.gopay:id/btn_primary",
    "com.gojek.gopay:id/primary_button",
]
ACTION_CONTENT_DESCRIPTIONS = [
    "pay",
    "pay now",
    "bayar",
    "bayar sekarang",
    "confirm",
    "konfirmasi",
    "setuju",
    "authorize",
    "izinkan",
]
ACTION_TEXT_PATTERN = re.compile(
    r"^(pay(?:\s+now)?|bayar(?:\s+sekarang)?|confirm|konfirmasi|setuju|authorize|izinkan|lanjutkan)$",
    re.I,
)
SUCCESS_TEXT_PATTERN = re.compile(r"(success|successful|approved|authorized|berhasil|selesai)", re.I)
TERMINAL_ERROR_PATTERN = re.compile(r"(failed|declined|ditolak|gagal|expired|kedaluwarsa|error)", re.I)
PIN_HINT_PATTERN = re.compile(r"(pin|password|passcode|sandi)", re.I)
ADB_LOCK = threading.Lock()


def utc_now_text():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def compact_text(value, limit=500):
    return str(value or "").replace("\r", " ").replace("\n", " ").strip()[:limit]


def log_info(message):
    print(f"[AndroidAppHelper] {message}", flush=True)


def normalize_server_port(raw_value, default=DEFAULT_PORT):
    candidate = default if raw_value is None or str(raw_value).strip() == "" else raw_value
    try:
        port = int(str(candidate).strip())
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid helper port: {raw_value}") from exc
    if port < 1 or port > 65535:
        raise ValueError(f"Helper port out of range: {port}")
    return port


def parse_csv(value):
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def resolve_server_config(argv=None, environ=None):
    runtime_environ = environ if environ is not None else os.environ
    parser = argparse.ArgumentParser(description="Start the local Android app automation helper service.")
    parser.add_argument(
        "--host",
        default=str(runtime_environ.get("ANDROID_APP_HELPER_HOST") or DEFAULT_HOST).strip() or DEFAULT_HOST,
        help="Server host. Defaults to ANDROID_APP_HELPER_HOST or 127.0.0.1.",
    )
    parser.add_argument(
        "--port",
        default=runtime_environ.get("ANDROID_APP_HELPER_PORT"),
        help="Server port. Defaults to ANDROID_APP_HELPER_PORT or 18768.",
    )
    parser.add_argument(
        "--adb",
        default=str(runtime_environ.get("ANDROID_ADB_PATH") or "adb").strip() or "adb",
        help="ADB executable path.",
    )
    parser.add_argument(
        "--device-id",
        default=str(runtime_environ.get("ANDROID_DEVICE_ID") or "").strip(),
        help="ADB device id. Defaults to the first connected device.",
    )
    parser.add_argument(
        "--appium-url",
        default=str(runtime_environ.get("ANDROID_APPIUM_URL") or DEFAULT_APPIUM_URL).strip() or DEFAULT_APPIUM_URL,
        help="Appium server URL.",
    )
    parser.add_argument(
        "--gopay-package",
        default=str(runtime_environ.get("ANDROID_GOPAY_APP_PACKAGE") or DEFAULT_GOPAY_APP_PACKAGE).strip() or DEFAULT_GOPAY_APP_PACKAGE,
        help="GoPay Android package name.",
    )
    parser.add_argument(
        "--gopay-activity",
        default=str(runtime_environ.get("ANDROID_GOPAY_APP_ACTIVITY") or DEFAULT_GOPAY_APP_ACTIVITY).strip(),
        help="Optional GoPay launch activity.",
    )
    parser.add_argument(
        "--fallback-tap",
        default=str(runtime_environ.get("ANDROID_GOPAY_FALLBACK_TAP") or "").strip(),
        help="Optional fallback tap coordinate as x,y. Disabled when empty.",
    )
    args = parser.parse_args(argv)
    try:
        port = normalize_server_port(args.port, default=DEFAULT_PORT)
    except ValueError as exc:
        parser.error(str(exc))
    fallback_tap = parse_fallback_tap(args.fallback_tap)
    return {
        "host": str(args.host or DEFAULT_HOST).strip() or DEFAULT_HOST,
        "port": port,
        "adb": str(args.adb or "adb").strip() or "adb",
        "device_id": str(args.device_id or "").strip(),
        "appium_url": str(args.appium_url or DEFAULT_APPIUM_URL).strip().rstrip("/") or DEFAULT_APPIUM_URL,
        "gopay_package": str(args.gopay_package or DEFAULT_GOPAY_APP_PACKAGE).strip() or DEFAULT_GOPAY_APP_PACKAGE,
        "gopay_activity": str(args.gopay_activity or "").strip(),
        "fallback_tap": fallback_tap,
    }


def parse_fallback_tap(value):
    raw = str(value or "").strip()
    if not raw:
        return None
    match = re.match(r"^\s*(\d{1,5})\s*,\s*(\d{1,5})\s*$", raw)
    if not match:
        raise ValueError("fallback tap must be formatted as x,y")
    return {
        "enabled": True,
        "x": int(match.group(1)),
        "y": int(match.group(2)),
    }


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.end_headers()
    handler.wfile.write(body)


def read_json_payload(handler):
    length = int(handler.headers.get("Content-Length", "0") or 0)
    raw = handler.rfile.read(length) if length > 0 else b"{}"
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise RuntimeError(f"Invalid JSON payload: {exc}") from exc


def run_command(args, timeout=REQUEST_TIMEOUT_SECONDS, text=True):
    completed = subprocess.run(
        args,
        capture_output=True,
        timeout=timeout,
        text=text,
        check=False,
    )
    stdout = completed.stdout if text else completed.stdout
    stderr = completed.stderr if text else completed.stderr
    return {
        "ok": completed.returncode == 0,
        "returncode": completed.returncode,
        "stdout": stdout,
        "stderr": stderr,
    }


def parse_bounds(value):
    match = re.match(r"^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$", str(value or "").strip())
    if not match:
        return None
    left, top, right, bottom = [int(item) for item in match.groups()]
    if right <= left or bottom <= top:
        return None
    return {
        "left": left,
        "top": top,
        "right": right,
        "bottom": bottom,
        "centerX": int((left + right) / 2),
        "centerY": int((top + bottom) / 2),
    }


def node_text(node):
    return " ".join([
        str(node.attrib.get("text") or "").strip(),
        str(node.attrib.get("content-desc") or "").strip(),
        str(node.attrib.get("resource-id") or "").strip(),
        str(node.attrib.get("class") or "").strip(),
    ]).strip()


def is_clickable_node(node):
    if node.attrib.get("clickable") == "true" or node.attrib.get("enabled") != "false":
        return parse_bounds(node.attrib.get("bounds")) is not None
    return False


def iter_nodes(xml_text):
    if not str(xml_text or "").strip():
        return []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []
    return list(root.iter("node"))


def summarize_ui_xml(xml_text, limit=40):
    rows = []
    for node in iter_nodes(xml_text):
        text = str(node.attrib.get("text") or "").strip()
        desc = str(node.attrib.get("content-desc") or "").strip()
        resource_id = str(node.attrib.get("resource-id") or "").strip()
        class_name = str(node.attrib.get("class") or "").strip()
        if not any([text, desc, resource_id]):
            continue
        rows.append({
            "text": text,
            "contentDesc": desc,
            "resourceId": resource_id,
            "className": class_name,
            "bounds": node.attrib.get("bounds") or "",
        })
        if len(rows) >= limit:
            break
    return rows


def select_action_node(xml_text, config=None):
    config = config or {}
    resource_ids = list(config.get("resource_ids") or ACTION_RESOURCE_IDS)
    content_descriptions = [item.lower() for item in (config.get("content_descriptions") or ACTION_CONTENT_DESCRIPTIONS)]
    nodes = [node for node in iter_nodes(xml_text) if is_clickable_node(node)]

    for node in nodes:
        resource_id = str(node.attrib.get("resource-id") or "").strip()
        content_desc = str(node.attrib.get("content-desc") or "").strip().lower()
        if resource_id and resource_id in resource_ids:
            return node, "resource-id"
        if content_desc and content_desc in content_descriptions:
            return node, "content-desc"

    for node in nodes:
        text = str(node.attrib.get("text") or node.attrib.get("content-desc") or "").strip()
        if text and ACTION_TEXT_PATTERN.search(text):
            return node, "text"

    return None, ""


def detect_pin_node(xml_text):
    for node in iter_nodes(xml_text):
        combined = node_text(node)
        class_name = str(node.attrib.get("class") or "").lower()
        password_flag = str(node.attrib.get("password") or "").lower() == "true"
        if parse_bounds(node.attrib.get("bounds")) and (
            password_flag
            or ("edittext" in class_name and PIN_HINT_PATTERN.search(combined))
            or PIN_HINT_PATTERN.search(combined)
        ):
            return node
    return None


def detect_text_pattern(xml_text, pattern):
    combined = " ".join(node_text(node) for node in iter_nodes(xml_text))
    return pattern.search(combined or "") is not None


class AppiumClient:
    def __init__(self, base_url):
        self.base_url = str(base_url or DEFAULT_APPIUM_URL).rstrip("/")

    def request_json(self, method, path, payload=None, timeout=REQUEST_TIMEOUT_SECONDS):
        body = None
        headers = {}
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = Request(f"{self.base_url}{path}", data=body, headers=headers, method=method)
        with urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}

    def status(self):
        try:
            payload = self.request_json("GET", "/status")
            return {"ok": True, "payload": payload}
        except Exception as exc:
            return {"ok": False, "error": compact_text(exc)}

    def create_session(self, config, device_id=""):
        capabilities = {
            "platformName": "Android",
            "appium:automationName": "UiAutomator2",
            "appium:appPackage": config["gopay_package"],
            "appium:noReset": True,
            "appium:newCommandTimeout": 120,
        }
        if config.get("gopay_activity"):
            capabilities["appium:appActivity"] = config["gopay_activity"]
        if device_id:
            capabilities["appium:udid"] = device_id
        payload = self.request_json("POST", "/session", {
            "capabilities": {
                "alwaysMatch": capabilities,
                "firstMatch": [{}],
            },
        }, timeout=45)
        session_id = payload.get("sessionId") or payload.get("value", {}).get("sessionId")
        if not session_id:
            raise RuntimeError(f"Appium did not return a session id: {payload}")
        return session_id

    def delete_session(self, session_id):
        try:
            self.request_json("DELETE", f"/session/{session_id}", timeout=5)
        except Exception:
            pass

    def activate_app(self, session_id, package_name):
        self.request_json("POST", f"/session/{session_id}/appium/device/activate_app", {
            "appId": package_name,
        }, timeout=20)


class AndroidAutomationController:
    def __init__(self, config):
        self.config = config
        self.appium = AppiumClient(config.get("appium_url") or DEFAULT_APPIUM_URL)

    def adb_args(self, device_id="", *extra):
        args = [self.config.get("adb") or "adb"]
        resolved_device_id = str(device_id or self.config.get("device_id") or "").strip()
        if resolved_device_id:
            args.extend(["-s", resolved_device_id])
        args.extend(extra)
        return args

    def adb(self, *extra, device_id="", timeout=REQUEST_TIMEOUT_SECONDS, text=True):
        with ADB_LOCK:
            return run_command(self.adb_args(device_id, *extra), timeout=timeout, text=text)

    def list_devices(self):
        result = self.adb("devices", timeout=8)
        if not result["ok"]:
            return {
                "adbAvailable": False,
                "devices": [],
                "error": compact_text(result["stderr"] or result["stdout"]),
            }
        devices = []
        for line in str(result["stdout"] or "").splitlines()[1:]:
            parts = line.strip().split()
            if len(parts) >= 2 and parts[1] == "device":
                devices.append(parts[0])
        return {
            "adbAvailable": True,
            "devices": devices,
        }

    def resolve_device_id(self, requested_device_id=""):
        requested = str(requested_device_id or self.config.get("device_id") or "").strip()
        devices = self.list_devices()
        if requested:
            if requested in devices.get("devices", []):
                return requested
            raise RuntimeError(f"Configured Android device is not connected: {requested}")
        if not devices.get("adbAvailable"):
            raise RuntimeError(devices.get("error") or "ADB is not available")
        if not devices.get("devices"):
            raise RuntimeError("No Android device is connected or authorized")
        return devices["devices"][0]

    def current_focus(self, device_id):
        result = self.adb("shell", "dumpsys", "window", device_id=device_id, timeout=10)
        output = str(result["stdout"] or "")
        package_name = ""
        activity = ""
        for line in output.splitlines():
            if "mCurrentFocus" not in line and "mFocusedApp" not in line:
                continue
            match = re.search(r"\s([a-zA-Z0-9_.]+)/([a-zA-Z0-9_.$]+)", line)
            if match:
                package_name = match.group(1)
                activity = match.group(2)
                break
        return {
            "packageName": package_name,
            "activity": activity,
        }

    def start_gopay_app(self, device_id, package_name=None, activity=None):
        package_name = package_name or self.config.get("gopay_package") or DEFAULT_GOPAY_APP_PACKAGE
        activity = activity if activity is not None else self.config.get("gopay_activity", "")
        if activity:
            component = f"{package_name}/{activity}"
            result = self.adb("shell", "am", "start", "-n", component, device_id=device_id, timeout=20)
        else:
            result = self.adb("shell", "monkey", "-p", package_name, "-c", "android.intent.category.LAUNCHER", "1", device_id=device_id, timeout=20)
        if not result["ok"]:
            raise RuntimeError(compact_text(result["stderr"] or result["stdout"]) or f"Failed to launch {package_name}")
        return True

    def dump_ui_xml(self, device_id):
        dump_result = self.adb("shell", "uiautomator", "dump", "/sdcard/window_dump.xml", device_id=device_id, timeout=20)
        if not dump_result["ok"]:
            raise RuntimeError(compact_text(dump_result["stderr"] or dump_result["stdout"]) or "uiautomator dump failed")
        cat_result = self.adb("exec-out", "cat", "/sdcard/window_dump.xml", device_id=device_id, timeout=20)
        if not cat_result["ok"]:
            raise RuntimeError(compact_text(cat_result["stderr"] or cat_result["stdout"]) or "failed to read UI dump")
        return str(cat_result["stdout"] or "")

    def screenshot(self, device_id, prefix="snapshot"):
        SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
        path = SNAPSHOT_DIR / f"{prefix}-{uuid.uuid4().hex[:12]}.png"
        result = self.adb("exec-out", "screencap", "-p", device_id=device_id, timeout=20, text=False)
        if result["ok"] and result["stdout"]:
            data = result["stdout"]
            if isinstance(data, str):
                data = data.encode("latin1", errors="ignore")
            path.write_bytes(data)
            return str(path)
        return ""

    def snapshot(self, payload=None):
        payload = payload or {}
        device_id = self.resolve_device_id(payload.get("deviceId") or payload.get("device_id") or "")
        focus = self.current_focus(device_id)
        xml_text = self.dump_ui_xml(device_id)
        screenshot_path = self.screenshot(device_id)
        return {
            "ok": True,
            "deviceId": device_id,
            "packageName": focus.get("packageName") or "",
            "activity": focus.get("activity") or "",
            "uiSummary": summarize_ui_xml(xml_text),
            "snapshotPath": screenshot_path,
        }

    def health(self):
        devices = self.list_devices()
        appium_status = self.appium.status()
        selected_device = ""
        package_name = ""
        activity = ""
        if devices.get("devices"):
            selected_device = self.config.get("device_id") or devices["devices"][0]
            try:
                focus = self.current_focus(selected_device)
                package_name = focus.get("packageName") or ""
                activity = focus.get("activity") or ""
            except Exception:
                pass
        return {
            "ok": bool(devices.get("adbAvailable")),
            "service": "android-app-helper",
            "version": 1,
            "time": utc_now_text(),
            "adbAvailable": bool(devices.get("adbAvailable")),
            "devices": devices.get("devices", []),
            "selectedDeviceId": selected_device,
            "appiumAvailable": bool(appium_status.get("ok")),
            "appiumUrl": self.config.get("appium_url") or DEFAULT_APPIUM_URL,
            "gopayPackage": self.config.get("gopay_package") or DEFAULT_GOPAY_APP_PACKAGE,
            "packageName": package_name,
            "activity": activity,
            **({"error": devices.get("error")} if devices.get("error") else {}),
        }

    def approve_gopay(self, payload=None):
        payload = payload or {}
        timeout_seconds = max(5, min(300, int(payload.get("timeoutSeconds") or APPROVE_TIMEOUT_SECONDS)))
        device_id = self.resolve_device_id(payload.get("deviceId") or payload.get("device_id") or "")
        package_name = str(payload.get("appPackage") or self.config.get("gopay_package") or DEFAULT_GOPAY_APP_PACKAGE).strip()
        activity = str(payload.get("appActivity") or self.config.get("gopay_activity") or "").strip()
        pin = str(payload.get("pin") or payload.get("gopayPin") or "").strip()
        fallback_tap = payload.get("fallbackTap") if isinstance(payload.get("fallbackTap"), dict) else self.config.get("fallback_tap")
        started_at = time.time()
        clicked = False
        entered_pin = False
        last_snapshot_path = ""

        log_info(f"starting GoPay app package={package_name} device={device_id}")
        self.start_gopay_app(device_id, package_name=package_name, activity=activity)
        time.sleep(2)

        while time.time() - started_at <= timeout_seconds:
            focus = self.current_focus(device_id)
            xml_text = self.dump_ui_xml(device_id)
            last_snapshot_path = self.screenshot(device_id, prefix="gopay")

            if detect_text_pattern(xml_text, SUCCESS_TEXT_PATTERN):
                return {
                    "ok": True,
                    "status": "approved",
                    "deviceId": device_id,
                    "packageName": focus.get("packageName") or package_name,
                    "activity": focus.get("activity") or "",
                    "snapshotPath": last_snapshot_path,
                }

            if detect_text_pattern(xml_text, TERMINAL_ERROR_PATTERN) and clicked:
                return {
                    "ok": False,
                    "retryable": False,
                    "code": "terminal_error",
                    "message": "GoPay app reported a terminal payment error.",
                    "deviceId": device_id,
                    "packageName": focus.get("packageName") or package_name,
                    "activity": focus.get("activity") or "",
                    "snapshotPath": last_snapshot_path,
                }

            pin_node = detect_pin_node(xml_text)
            if pin_node is not None and pin and not entered_pin:
                self.adb("shell", "input", "text", pin, device_id=device_id, timeout=10)
                entered_pin = True
                log_info("entered GoPay PIN through ADB input")
                time.sleep(1)
                continue

            action_node, strategy = select_action_node(xml_text)
            if action_node is not None:
                bounds = parse_bounds(action_node.attrib.get("bounds"))
                if bounds:
                    self.adb("shell", "input", "tap", str(bounds["centerX"]), str(bounds["centerY"]), device_id=device_id, timeout=10)
                    clicked = True
                    log_info(f"tapped GoPay action via {strategy} at {bounds['centerX']},{bounds['centerY']}")
                    time.sleep(POLL_INTERVAL_SECONDS)
                    continue

            if not clicked and fallback_tap and fallback_tap.get("enabled"):
                x = int(fallback_tap.get("x") or 0)
                y = int(fallback_tap.get("y") or 0)
                if x > 0 and y > 0:
                    self.adb("shell", "input", "tap", str(x), str(y), device_id=device_id, timeout=10)
                    clicked = True
                    log_info(f"tapped GoPay fallback coordinate from config at {x},{y}")
                    time.sleep(POLL_INTERVAL_SECONDS)
                    continue

            time.sleep(POLL_INTERVAL_SECONDS)

        return {
            "ok": False,
            "retryable": True,
            "code": "wait_timeout",
            "message": "Timed out waiting for an actionable GoPay app confirmation screen.",
            "deviceId": device_id,
            "packageName": package_name,
            "activity": self.current_focus(device_id).get("activity") or "",
            "snapshotPath": last_snapshot_path,
        }


class AndroidAppHelperHandler(BaseHTTPRequestHandler):
    controller = None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path in {"/", "/health"}:
            return json_response(self, 200, self.controller.health())
        return json_response(self, 404, {
            "ok": False,
            "error": f"Unsupported path: {path}",
        })

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            payload = read_json_payload(self)
            if path == "/gopay/approve":
                result = self.controller.approve_gopay(payload)
                return json_response(self, 200 if result.get("ok") else 409, result)
            if path == "/device/snapshot":
                return json_response(self, 200, self.controller.snapshot(payload))
            return json_response(self, 404, {
                "ok": False,
                "error": f"Unsupported path: {path}",
            })
        except Exception as exc:
            log_info(f"request failed path={path} error={compact_text(exc)}")
            log_info(traceback.format_exc())
            return json_response(self, 500, {
                "ok": False,
                "retryable": True,
                "code": "helper_error",
                "message": compact_text(exc),
            })


def main(argv=None):
    config = resolve_server_config(argv)
    AndroidAppHelperHandler.controller = AndroidAutomationController(config)
    server = ThreadingHTTPServer((config["host"], config["port"]), AndroidAppHelperHandler)
    log_info(f"listening on http://{config['host']}:{config['port']}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log_info("shutting down")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
