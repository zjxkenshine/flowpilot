import importlib.util
import unittest
from pathlib import Path


def load_android_app_helper():
    module_path = Path(__file__).resolve().parents[1] / "scripts" / "android_app_helper.py"
    spec = importlib.util.spec_from_file_location("android_app_helper", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


android_app_helper = load_android_app_helper()


def node(resource_id="", text="", content_desc="", bounds="[10,20][110,70]"):
    return (
        '<node index="0" text="{text}" resource-id="{resource_id}" '
        'class="android.widget.Button" package="com.gojek.gopay" '
        'content-desc="{content_desc}" clickable="true" enabled="true" bounds="{bounds}" />'
    ).format(
        text=text,
        resource_id=resource_id,
        content_desc=content_desc,
        bounds=bounds,
    )


class AndroidAppHelperSelectionTest(unittest.TestCase):
    def test_select_action_node_prefers_resource_id_then_text(self):
        xml = f"<hierarchy>{node(text='Bayar')}{node(resource_id='com.gojek.gopay:id/btn_pay', text='Other')}</hierarchy>"

        picked, strategy = android_app_helper.select_action_node(xml)

        self.assertEqual(strategy, "resource-id")
        self.assertEqual(picked.attrib["resource-id"], "com.gojek.gopay:id/btn_pay")

    def test_select_action_node_uses_text_when_no_stable_id_matches(self):
        xml = f"<hierarchy>{node(text='Konfirmasi')}</hierarchy>"

        picked, strategy = android_app_helper.select_action_node(xml)

        self.assertEqual(strategy, "text")
        self.assertEqual(picked.attrib["text"], "Konfirmasi")

    def test_parse_fallback_tap_requires_explicit_config(self):
        self.assertIsNone(android_app_helper.parse_fallback_tap(""))
        self.assertEqual(android_app_helper.parse_fallback_tap("120,640"), {
            "enabled": True,
            "x": 120,
            "y": 640,
        })
        with self.assertRaises(ValueError):
            android_app_helper.parse_fallback_tap("bad")


if __name__ == "__main__":
    unittest.main()
