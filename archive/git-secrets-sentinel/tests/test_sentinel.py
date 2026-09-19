import tempfile
import unittest
from pathlib import Path

from sentinel import scan_file


class SentinelTests(unittest.TestCase):
    def make_file(self, content):
        handle = tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", delete=False)
        handle.write(content)
        handle.close()
        self.addCleanup(Path(handle.name).unlink)
        return handle.name

    def test_clean_file(self):
        path = self.make_file("password = os.environ.get('PASSWORD')")
        self.assertEqual(scan_file(path), [])

    def test_detects_aws_key(self):
        path = self.make_file("AWS_KEY = 'AKIA1234567890ABCDEF'")
        self.assertIn("AWS access key", scan_file(path))

    def test_detects_private_key(self):
        path = self.make_file("-----BEGIN PRIVATE KEY-----\n...")
        self.assertIn("private key", scan_file(path))

    def test_detects_hardcoded_password(self):
        path = self.make_file('password = "secret123"')
        self.assertIn("hardcoded password", scan_file(path))


if __name__ == "__main__":
    unittest.main()
