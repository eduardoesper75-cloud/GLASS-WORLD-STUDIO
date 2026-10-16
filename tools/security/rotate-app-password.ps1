<#
.SYNOPSIS
  Rotación ASISTIDA de una contraseña de aplicación de Google (casillas GWS).
.DESCRIPTION
  Actualiza el valor de la app password en `.env.local` (nunca se imprime ni se versiona) y,
  opcionalmente, en el `.env` del runner OpenOutreach. La GENERACIÓN de la nueva app password
  es MANUAL (requiere entrar a la cuenta con la contraseña maestra + 2FA): ver
  docs/security/GWS_S1_Remediacion_Credenciales.md §2.1.

  El agente NUNCA maneja el secreto: este script lo pide por entrada segura y lo escribe directo
  en el `.env` (que está ignorado por git).

.EXAMPLE
  # 1) Revocá la vieja y generá la nueva en https://myaccount.google.com/apppasswords
  # 2) Ejecutá:
  powershell -ExecutionPolicy Bypass -File tools/security/rotate-app-password.ps1 -Account esper.eduardo -Validate

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/security/rotate-app-password.ps1 -Account eduardoesper75
#>
param(
  [ValidateSet('eduardoesper75', 'esper.eduardo')]
  [string]$Account = 'esper.eduardo',
  [string]$EnvFile = (Join-Path $PSScriptRoot '..\..\.env.local'),
  [switch]$Validate,
  [string]$OutreachEnv = (Join-Path $env:LOCALAPPDATA 'gws-tools\openoutreach\.env')
)

$ErrorActionPreference = 'Stop'

$KEY = @{
  'eduardoesper75' = 'IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD'
  'esper.eduardo'  = 'IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_PASSWORD'
}[$Account]

Write-Host "Casilla: $Account  ->  clave en .env: $KEY" -ForegroundColor Cyan
Write-Host "Paso previo (manual): revocá la app password vieja y creá una nueva en" -ForegroundColor Yellow
Write-Host "  https://myaccount.google.com/apppasswords" -ForegroundColor Yellow
Write-Host ""

$sec = Read-Host -AsSecureString "Pegá la NUEVA app password (16 letras, sin espacios)"
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
try { $new = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
$new = ($new -replace '\s', '')
if ($new.Length -lt 12) { throw "Valor demasiado corto; abortando (no se modificó nada)." }

if (-not (Test-Path $EnvFile)) { throw "No existe $EnvFile" }
$found = $false
$out = New-Object System.Collections.Generic.List[string]
foreach ($l in (Get-Content $EnvFile)) {
  if ($l -match "^\s*$([regex]::Escape($KEY))\s*=") { $found = $true; $out.Add("$KEY=$new") }
  else { $out.Add($l) }
}
if (-not $found) { $out.Add("$KEY=$new") }
[System.IO.File]::WriteAllLines($EnvFile, [string[]]$out, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] $KEY actualizada en $EnvFile (valor NO mostrado)." -ForegroundColor Green

if ($Account -eq 'esper.eduardo' -and (Test-Path $OutreachEnv)) {
  $oout = New-Object System.Collections.Generic.List[string]
  $ofound = $false
  foreach ($l in (Get-Content $OutreachEnv)) {
    if ($l -match '^\s*OUTSEND_MAILBOX_PASSWORD\s*=') { $ofound = $true; $oout.Add("OUTSEND_MAILBOX_PASSWORD=$new") }
    else { $oout.Add($l) }
  }
  if ($ofound) {
    [System.IO.File]::WriteAllLines($OutreachEnv, [string[]]$oout, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "[OK] OUTSEND_MAILBOX_PASSWORD actualizada en el .env del runner." -ForegroundColor Green
  } else {
    Write-Host "[i] El .env del runner no tiene OUTSEND_MAILBOX_PASSWORD; no se tocó." -ForegroundColor DarkYellow
  }
}

Write-Host "`nRecomendado: correr el escáner de secretos -> tools\security\scan-secrets.ps1" -ForegroundColor Cyan
if ($Validate) {
  Write-Host "Validando IMAP (mail-cleanup audit, sólo lectura)..." -ForegroundColor Cyan
  & pnpm --filter '@gws/mail-cleanup' start audit --days 1 --use-system-ca
}
