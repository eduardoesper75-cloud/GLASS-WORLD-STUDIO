# Runs a BOUNDED OpenOutreach batch, loading the checkout .env if present.
#
#   powershell -File gws-context/run.ps1 status
#   powershell -File gws-context/run.ps1 find  25            # free discovery only
#   powershell -File gws-context/run.ps1 find  25 -Emails    # + paid email lookup
#   powershell -File gws-context/run.ps1 send  10
#   powershell -File gws-context/run.ps1 run   25
#
# Notes:
#  - A "batch" is finite on purpose: this tool is not a continuous daemon.
#  - find discovers and qualifies; send mails what is stored; run does both.
#  - -Emails spends BetterContact credits on address resolution. Off by default.
#  - Campaign context is applied separately: python gws-context/apply_context.py

param(
  [ValidateSet('status', 'find', 'send', 'run')]
  [string]$Action = 'status',
  [int]$Count = 25,
  [switch]$Emails
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here
$envFile = Join-Path $root '.env'

if (Test-Path -LiteralPath $envFile) {
  Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
      $parts = $line -split '=', 2
      $key = $parts[0].Trim()
      $value = $parts[1].Trim().Trim([char]34).Trim([char]39)
      [Environment]::SetEnvironmentVariable($key, $value)
    }
  }
  Write-Host "env: loaded from $envFile"
} else {
  Write-Host "env: no .env at $envFile - only 'status' will work"
}

$uv = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe\uv.exe'
if (-not (Test-Path -LiteralPath $uv)) {
  throw "uv.exe not found at $uv"
}

$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
Set-Location -LiteralPath $root

switch ($Action) {
  'status' { & $uv run openoutreach status }
  'find' {
    if ($Emails) { & $uv run openoutreach find $Count --emails }
    else { & $uv run openoutreach find $Count }
  }
  'send' { & $uv run openoutreach send $Count }
  'run'  { & $uv run openoutreach run $Count }
}
