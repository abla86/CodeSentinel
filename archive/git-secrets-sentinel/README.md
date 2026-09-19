# Git Secrets Sentinel

Lightweight shift-left secret detection for staged Git changes.

## What it does

Git Secrets Sentinel inspects files in the Git staging area before commit and blocks the commit when configured secret patterns are detected.

Detected patterns include:

- AWS access-key format
- Private-key headers
- Hardcoded password assignments
- Azure secret/token assignments
- Generic API-key/token assignments

## Why it exists

Accidental credential exposure is a preventable engineering failure. A local pre-commit guardrail gives developers immediate feedback before sensitive material reaches the remote repository.

## Install as a pre-commit hook

From a target repository:

```powershell
powershell -ExecutionPolicy Bypass -File C:\path\to\git-secrets-sentinel\install-hook.ps1
```

Or run the scanner directly:

```powershell
python C:\path\to\git-secrets-sentinel\sentinel.py
```

## Example

```text
SECURITY ERROR: config.txt: hardcoded password

COMMIT BLOCKED: remove or externalize detected secrets before committing.
```

## Limitations

This is a pattern-based guardrail. It cannot guarantee detection of every secret and can produce false positives. It should complement repository secret scanning, push protection, credential rotation and proper secret management.

## Development

```powershell
python -m unittest discover -s tests -v
python -m py_compile sentinel.py
```

## License

MIT

## Change-control audit

See `docs/REPOSITORY-CHANGE-AUDIT-2026-08-28.md` for change-control and traceability rules.
