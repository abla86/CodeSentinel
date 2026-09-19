$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    throw "Run this script from inside a Git repository."
}

$scriptRoot = Split-Path -Parent $PSCommandPath
$sentinelPath = Join-Path $scriptRoot "sentinel.py"
$hookPath = Join-Path $repoRoot ".git\hooks\pre-commit"

$hook = @"
#!/usr/bin/env sh
python \"$sentinelPath\"
status=\$?
if [ \$status -ne 0 ]; then
  exit \$status
fi
exit 0
"@

Set-Content -Path $hookPath -Value $hook -Encoding UTF8
Write-Host "Git Secrets Sentinel pre-commit hook installed: $hookPath"
