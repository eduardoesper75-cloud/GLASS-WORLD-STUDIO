<#
.SYNOPSIS
  Remediación S1 — reescribe el HISTORIAL de Git en un CLON para borrar credenciales
  expuestas, sin tocar el repositorio en vivo.

.DESCRIPTION
  Pasos que ejecuta:
    1) Recolecta los secretos a borrar:
         - valores de .env.local para claves con PASSWORD/SECRET/TOKEN/API_KEY,
         - los de -ExtraSecrets y -ExtraSecretsFile (p. ej. contraseñas de cuenta).
       Los secretos NUNCA se escriben en archivos versionados.
    2) Crea un BUNDLE de respaldo del repo en vivo (restaurable).
    3) Clona el repo (solo historial confirmado) a OutDir\gws-scrubbed.
    4) Descarga git-filter-repo (script Python de un solo archivo) si falta.
    5) Aplica --replace-text: cada secreto -> <REDACTED>.
    6) Verifica que ningún secreto quede en el historial del clon.
    7) Empaqueta el clon saneado en un bundle.

  El repo en vivo NO se modifica. La adopción del historial saneado es un paso
  manual posterior (ver docs/security/GWS_S1_Remediacion_Credenciales.md).

.PARAMETER Repo
  Ruta del repositorio en vivo (default: directorio actual).
.PARAMETER OutDir
  Carpeta de salida (default: $env:LOCALAPPDATA\Temp\opencode\gws-scrub).
.PARAMETER ExtraSecrets
  Secretos adicionales a redactar (p. ej. contraseñas de cuenta ya no válidas).
.PARAMETER ExtraSecretsFile
  Archivo no versionado con un secreto por línea.
.PARAMETER EnvLocal
  Ruta de .env.local (default: <Repo>\.env.local).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/security/scrub-git-history.ps1 -ExtraSecrets "cuenta-vieja-1","cuenta-vieja-2"
#>
[CmdletBinding()]
param(
  [string]$Repo = (Get-Location).Path,
  [string]$OutDir = (Join-Path $env:LOCALAPPDATA 'Temp\opencode\gws-scrub'),
  [string[]]$ExtraSecrets = @(),
  [string]$ExtraSecretsFile = '',
  [string]$EnvLocal = ''
)
$ErrorActionPreference = 'Stop'

function Write-Utf8NoBom([string]$Path, [string]$Text) {
  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

if (-not $EnvLocal) { $EnvLocal = Join-Path $Repo '.env.local' }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# ---- 1) Recolectar secretos -------------------------------------------------
$secrets = New-Object System.Collections.Generic.List[string]

if (Test-Path $EnvLocal) {
  Get-Content $EnvLocal | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.+?)\s*$') {
      $key = $Matches[1]; $val = $Matches[2].Trim('"').Trim("'")
      if ($key -match '(?i)(PASSWORD|SECRET|TOKEN|API_KEY)' -and $val.Length -ge 8) {
        [void]$secrets.Add($val)
      }
    }
  }
}
foreach ($s in $ExtraSecrets) { if ($s -and $s.Length -ge 6) { [void]$secrets.Add($s.Trim()) } }
if ($ExtraSecretsFile -and (Test-Path $ExtraSecretsFile)) {
  Get-Content $ExtraSecretsFile | ForEach-Object { $t = $_.Trim(); if ($t.Length -ge 6) { [void]$secrets.Add($t) } }
}
$secrets = $secrets | Select-Object -Unique

if (-not $secrets -or ($secrets | Measure-Object).Count -eq 0) {
  throw "No se recolectó ningún secreto. Revisá .env.local o pasá -ExtraSecrets."
}
Write-Host ("[1/7] Secretos a redactar: " + ($secrets | Measure-Object).Count + " (no se muestran valores)") -ForegroundColor Cyan

# ---- 2) Backup bundle del repo en vivo --------------------------------------
$backup = Join-Path $OutDir ("backup-antes-de-scrub-" + $stamp + ".bundle")
git -C $Repo bundle create $backup --all | Out-Null
Write-Host ("[2/7] Respaldo: " + $backup) -ForegroundColor Green

# ---- 3) Clon ----------------------------------------------------------------
$clone = Join-Path $OutDir 'gws-scrubbed'
if (Test-Path $clone) { Remove-Item -Recurse -Force $clone }
git clone --no-hardlinks --quiet $Repo $clone
Write-Host ("[3/7] Clon: " + $clone) -ForegroundColor Green

# ---- 4) git-filter-repo -----------------------------------------------------
$tool = Join-Path $OutDir 'git-filter-repo.py'
if (-not (Test-Path $tool)) {
  Write-Host "[4/7] Descargando git-filter-repo..."
  Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo' -OutFile $tool
}
Write-Host ("[4/7] filter-repo: " + $tool) -ForegroundColor Green

# ---- 5) replacements + rewrite ---------------------------------------------
$rep = Join-Path $OutDir ("replacements-" + $stamp + ".txt")
$sb = New-Object System.Text.StringBuilder
foreach ($s in $secrets) { [void]$sb.AppendLine($s + '==><REDACTED>') }
Write-Utf8NoBom $rep $sb.ToString()

Push-Location $clone
try {
  python $tool --force --replace-text $rep
} finally {
  Pop-Location
}
Write-Host "[5/7] Historial reescrito en el clon." -ForegroundColor Green

# ---- 6) Verificación --------------------------------------------------------
Write-Host "[6/7] Verificando que no queden secretos en el historial del clon..."
$leaks = 0
foreach ($s in $secrets) {
  $hits = git -C $clone log --oneline -S $s --all 2>$null
  if ($hits) { $leaks++; Write-Host ("   [!] persiste en: " + ($hits | Select-Object -First 3)) -ForegroundColor Red }
}
if ($leaks -gt 0) { throw "Verificación fallida: $leaks secreto(s) aún presentes. NO adoptar." }
Write-Host "   OK: 0 coincidencias." -ForegroundColor Green

# ---- 7) Bundle del clon saneado --------------------------------------------
$cleanBundle = Join-Path $OutDir ("gws-scrubbed-" + $stamp + ".bundle")
git -C $clone bundle create $cleanBundle --all | Out-Null
Write-Host ("[7/7] Bundle saneado: " + $cleanBundle) -ForegroundColor Green

Write-Host ""
Write-Host "LISTO. El repo en vivo NO fue modificado." -ForegroundColor Green
Write-Host "Adopción (cuando el árbol esté limpio): ver docs/security/GWS_S1_Remediacion_Credenciales.md" -ForegroundColor Yellow
Write-Host ("Respaldo: " + $backup)
