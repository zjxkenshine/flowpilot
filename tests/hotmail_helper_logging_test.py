import http.client
import importlib.util
import io
import json
import threading
import unittest
from contextlib import redirect_stderr, redirect_stdout
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock


def load_hotmail_helper():
    module_path = Path(__file__).resolve().parents[1] / "scripts" / "hotmail_helper.py"
    spec = importlib.util.spec_from_file_location("hotmail_helper", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


hotmail_helper = load_hotmail_helper()


class QuietHotmailHelperHandler(hotmail_helper.HotmailHelperHandler):
    def log_message(self, format, *args):
        pass


class HotmailHelperServerTestCase(unittest.TestCase):
    def start_server(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHotmailHelperHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(thread.join, 2)
        self.addCleanup(server.shutdown)
        return server

    def request_json(self, server, method, path, body=None):
        host, port = server.server_address
        conn = http.client.HTTPConnection(host, port, timeout=5)
        encoded_body = None
        headers = {}
        if body is not None:
            encoded_body = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        try:
            conn.request(method, path, body=encoded_body, headers=headers)
            response = conn.getresponse()
            raw_body = response.read()
            payload = json.loads(raw_body.decode("utf-8")) if raw_body else None
            return response, payload
        finally:
            conn.close()


class HotmailHelperServerConfigTest(unittest.TestCase):
    def test_resolve_server_config_uses_default_host_and_port(self):
        config = hotmail_helper.resolve_server_config([], environ={})

        self.assertEqual(config, {
            "host": "127.0.0.1",
            "port": 17373,
        })

    def test_resolve_server_config_uses_env_and_cli_overrides(self):
        env_config = hotmail_helper.resolve_server_config([], environ={
            "HOTMAIL_HELPER_HOST": "127.0.0.2",
            "HOTMAIL_HELPER_PORT": "17374",
        })
        cli_config = hotmail_helper.resolve_server_config(["--host", "0.0.0.0", "--port", "17375"], environ={
            "HOTMAIL_HELPER_HOST": "127.0.0.2",
            "HOTMAIL_HELPER_PORT": "17374",
        })

        self.assertEqual(env_config, {
            "host": "127.0.0.2",
            "port": 17374,
        })
        self.assertEqual(cli_config, {
            "host": "0.0.0.0",
            "port": 17375,
        })

    def test_invalid_server_ports_fail_validation(self):
        for raw_port in ["0", "65536", "abc"]:
            with self.subTest(raw_port=raw_port):
                with self.assertRaises(ValueError):
                    hotmail_helper.normalize_server_port(raw_port)

        with self.assertRaises(SystemExit):
            with redirect_stderr(io.StringIO()):
                hotmail_helper.resolve_server_config(["--port", "abc"], environ={})


class HotmailHelperHttpTest(HotmailHelperServerTestCase):
    def test_health_endpoint_returns_json_and_cors_methods(self):
        server = self.start_server()

        response, payload = self.request_json(server, "GET", "/health")

        self.assertEqual(response.status, 200)
        self.assertEqual(response.getheader("Access-Control-Allow-Methods"), "GET, POST, OPTIONS")
        self.assertEqual(payload["ok"], True)
        self.assertEqual(payload["service"], "hotmail-helper")
        self.assertEqual(payload["version"], 1)
        self.assertTrue(payload["time"].endswith("Z"))

    def test_root_health_alias_and_options_return_cors_methods(self):
        server = self.start_server()

        root_response, root_payload = self.request_json(server, "GET", "/")
        options_response, options_payload = self.request_json(server, "OPTIONS", "/health")

        self.assertEqual(root_response.status, 200)
        self.assertEqual(root_payload["ok"], True)
        self.assertEqual(root_payload["service"], "hotmail-helper")
        self.assertEqual(options_response.status, 204)
        self.assertEqual(options_response.getheader("Access-Control-Allow-Methods"), "GET, POST, OPTIONS")
        self.assertIsNone(options_payload)

    def test_unknown_get_path_returns_404(self):
        server = self.start_server()

        response, payload = self.request_json(server, "GET", "/missing")

        self.assertEqual(response.status, 404)
        self.assertEqual(payload["ok"], False)
        self.assertIn("Unsupported path", payload["error"])

    def test_post_paths_ignore_query_strings(self):
        server = self.start_server()

        with mock.patch.object(hotmail_helper, "append_account_log", return_value="mock-log.txt") as append_account_log:
            response, payload = self.request_json(server, "POST", "/append-account-log?source=test", {
                "email": "user@example.com",
                "password": "secret",
                "status": "success",
                "recordedAt": "2026-05-26T00:00:00Z",
                "reason": "done",
            })

        self.assertEqual(response.status, 200)
        self.assertEqual(payload, {
            "ok": True,
            "filePath": "mock-log.txt",
        })
        append_account_log.assert_called_once_with(
            "user@example.com",
            "secret",
            "success",
            "2026-05-26T00:00:00Z",
            "done",
        )


class HotmailHelperLoggingTest(unittest.TestCase):
    def test_select_latest_code_can_use_full_body_when_preview_is_truncated(self):
        css_prefix = (
            'Your temporary ChatGPT verification code '
            '@font-face { font-family: "Söhne"; src: url(https://cdn.openai.com/common/fonts/soehne/soehne-buch.woff2) format("woff2"); } '
            '.ExternalClass { width: 100%; } '
            '#bodyTable { width: 560px; } '
            'body { min-width: 100% !important; } '
        ) * 8
        full_body = (
            css_prefix
            + 'Enter this temporary verification code to continue: 272964 '
            + 'Please ignore this email if this was not you.'
        )
        message = {
            "id": "imap-1",
            "mailbox": "INBOX",
            "subject": "Your temporary ChatGPT verification code",
            "from": {
                "emailAddress": {
                    "address": "otp@tm1.openai.com",
                    "name": "OpenAI",
                }
            },
            "bodyPreview": full_body[:500],
            "body": {
                "content": full_body,
            },
            "receivedTimestamp": 200,
        }

        result = hotmail_helper.select_latest_code(
            [message],
            ['openai', 'noreply', 'verify', 'auth', 'chatgpt', 'duckduckgo', 'forward'],
            ['verify', 'verification', 'code', '验证码', 'confirm', 'login'],
            [],
            0,
        )

        self.assertEqual(result["code"], "272964")
        self.assertEqual(result["message"]["id"], "imap-1")

    def test_log_openai_messages_logs_full_body_when_available(self):
        messages = [{
            "mailbox": "INBOX",
            "subject": "Your verification code",
            "from": {
                "emailAddress": {
                    "address": "account-security@openai.com",
                    "name": "OpenAI",
                }
            },
            "bodyPreview": "Use 123456 to continue.",
            "body": {
                "content": "Hello there\nUse 123456 to continue.",
            },
        }]

        output = io.StringIO()
        with redirect_stdout(output):
            hotmail_helper.log_openai_messages(messages, transport="imap")

        rendered = output.getvalue()
        self.assertIn(
            "[HotmailHelper] openai mail received transport=imap mailbox=INBOX sender=account-security@openai.com senderName=OpenAI subject=Your verification code",
            rendered,
        )
        self.assertIn(
            "[HotmailHelper] openai mail full body start transport=imap mailbox=INBOX sender=account-security@openai.com senderName=OpenAI subject=Your verification code",
            rendered,
        )
        self.assertIn("Hello there\nUse 123456 to continue.", rendered)
        self.assertIn("[HotmailHelper] openai mail full body end", rendered)

    def test_log_openai_messages_falls_back_to_preview_without_full_body(self):
        messages = [{
            "mailbox": "Junk",
            "subject": "Verify your sign in",
            "from": {
                "emailAddress": {
                    "address": "noreply@tm.openai.com",
                    "name": "ChatGPT",
                }
            },
            "bodyPreview": "Use 654321 to continue.",
        }]

        output = io.StringIO()
        with redirect_stdout(output):
            hotmail_helper.log_openai_messages(messages, transport="graph")

        rendered = output.getvalue()
        self.assertIn(
            "[HotmailHelper] openai mail received transport=graph mailbox=Junk sender=noreply@tm.openai.com senderName=ChatGPT subject=Verify your sign in",
            rendered,
        )
        self.assertIn(
            "[HotmailHelper] openai mail preview transport=graph mailbox=Junk sender=noreply@tm.openai.com senderName=ChatGPT subject=Verify your sign in preview=Use 654321 to continue.",
            rendered,
        )
        self.assertNotIn("openai mail full body start", rendered)

    def test_refresh_access_token_logs_invalid_grant_and_direct_connection_refused_separately(self):
        failures = [
            {
                "ok": False,
                "endpoint": "entra-common-delegated",
                "url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                "status": 400,
                "error": '{"error":"invalid_grant","error_description":"AADSTS70000"}',
                "elapsed_ms": 101,
            },
            {
                "ok": False,
                "endpoint": "entra-consumers-delegated",
                "url": "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
                "status": None,
                "error": "Token request failed: <urlopen error [Errno 61] Connection refused>",
                "elapsed_ms": 88,
            },
        ]

        with mock.patch.object(hotmail_helper, "try_refresh_access_token", side_effect=failures), \
             mock.patch.object(hotmail_helper, "get_proxy_debug_context", return_value="direct"):
            output = io.StringIO()
            with redirect_stdout(output):
                with self.assertRaises(RuntimeError):
                    hotmail_helper.refresh_access_token(
                        "client-id-demo",
                        "refresh-token-demo",
                        ["entra-common-delegated", "entra-consumers-delegated"],
                    )

        rendered = output.getvalue()
        self.assertIn("category=invalid_grant", rendered)
        self.assertIn("category=connection_refused", rendered)

    def test_graph_and_outlook_message_urls_are_encoded(self):
        captured_urls = []

        def fake_get_json(url, headers=None):
            captured_urls.append(url)
            return 200, {"value": []}

        with mock.patch.object(hotmail_helper, "get_json", side_effect=fake_get_json):
            hotmail_helper.fetch_graph_messages("access-token-demo", mailbox="INBOX", top=5)
            hotmail_helper.fetch_outlook_api_messages("access-token-demo", mailbox="INBOX", top=5)

        self.assertEqual(len(captured_urls), 2)
        self.assertTrue(all(" " not in url for url in captured_urls))
        self.assertIn("%24orderby=receivedDateTime+desc", captured_urls[0])
        self.assertIn("%24orderby=ReceivedDateTime+desc", captured_urls[1])


if __name__ == "__main__":
    unittest.main()
