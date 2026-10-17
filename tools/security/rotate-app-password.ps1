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
  powershell -ExecutionPolicy Bypass -File tools/security/rotate-app-password.ps1 -Account eduardoesper75 -Validate
#>
#
# NOTA: la casilla de envío del runner OpenOutreach es la INSTITUCIONAL
# (edu.esper@glassworldstudio.com.ar, Don Web, NO Google): su contraseña se define en el
# `.env` del runner, no con una app password de Google (Checklist de salida §1).
param(
  [ValidateSet('eduardoesper75')]
  [string]$Account = 'eduardoesper75',
  [string]$EnvFile = (Join-Path $PSScriptRoot '..\..\.env.local'),
  [switch]$Validate
)

$ErrorActionPreference = 'Stop'

$KEY = @{
  'eduardoesper75' = 'IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD'
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

Write-Host "`nRecomendado: correr el escáner de secretos -> tools\security\scan-secrets.ps1" -ForegroundColor Cyan
if ($Validate) {
  Write-Host "Validando IMAP (mail-cleanup audit, sólo lectura)..." -ForegroundColor Cyan
  & pnpm --filter '@gws/mail-cleanup' start audit --days 1 --use-system-ca
}
