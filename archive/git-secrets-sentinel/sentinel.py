import os
import re
import subprocess
import sys
from pathlib import Path

PATTERNS = [
    (
        "AWS access key",
        re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    ),
    (
        "private key",
        re.compile(
            r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"
        ),
    ),
    (
        "hardcoded password",
        re.compile(
            r"(?i)\bpassword\s*[:=]\s*[\"'][^\"']{4,}[\"']"
        ),
    ),
    (
        "Azure secret assignment",
        re.compile(
            r"(?i)\bAZURE_[A-Z0-9_]*(?:SECRET|PASSWORD|KEY|TOKEN)[A-Z0-9_]*\s*[:=]\s*[\"'][^\"']{8,}[\"']"
        ),
    ),
    (
        "generic API token",
        re.compile(
            r"(?i)\b(?:api[_-]?key|api[_-]?token|secret[_-]?key)\s*[:=]\s*[\"'][^\"']{12,}[\"']"
        ),
    ),
]


def staged_files():
    result = subprocess.run(
        [
            "git",
            "diff",
            "--cached",
            "--name-only",
            "--diff-filter=ACMR",
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        print("ERROR: Not inside a Git repository or Git is unavailable.")
        return []

    return [
        filename
        for filename in result.stdout.splitlines()
        if filename.strip()
    ]


def scan_file(filepath):
    try:
        content = Path(filepath).read_text(
            encoding="utf-8",
            errors="ignore",
        )
    except OSError as exc:
        print(f"WARNING: Could not read {filepath}: {exc}")
        return []

    findings = []

    for name, pattern in PATTERNS:
        if pattern.search(content):
            findings.append(name)

    return findings


def main():
    files = staged_files()

    if not files:
        print("Sentinel: no staged files to scan.")
        return 0

    blocked = False

    for filepath in files:
        if not os.path.isfile(filepath):
            continue

        findings = scan_file(filepath)

        if findings:
            blocked = True
            print(
                f"SECURITY ERROR: {filepath}: "
                f"{', '.join(findings)}"
            )

    if blocked:
        print()
        print(
            "COMMIT BLOCKED: remove or externalize "
            "detected secrets before committing."
        )
        return 1

    print(
        f"Sentinel check passed: "
        f"{len(files)} staged file(s) scanned."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
