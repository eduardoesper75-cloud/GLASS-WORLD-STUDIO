<#
.SYNOPSIS
  Escáner de secretos para el repositorio GWS (solo lectura; no modifica nada).

.DESCRIPTION
  Dos capas:
    A) Patrones DUROS (formato de credencial): Google API key, OpenAI, GitHub PAT,
       Slack, AWS, clave privada PEM. Cuentan como fallo.
    B) Heurística SUAVE (clave=valor) aplicada SOLO a documentos (*.md/*.json/*.yml/
       *.txt/*.csv/.env.example), con filtro de placeholders. Cuenta como aviso.
  Revisa árbol rastreado e historial (`-History`).

  Códigos: 0 = limpio; 1 = hallazgos duros; 2 = solo avisos suaves.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/security/scan-secrets.ps1
.EXAMPLE
  & .\tools\security\scan-secrets.ps1 -History:$false
#>
[CmdletBinding()]
param(
  [string]$Repo = (Get-Location).Path,
  [switch]$History = $true
)

$ErrorActionPreference = 'Continue'

# A) Formatos de credencial (alta confianza)
$hardPatterns = @(
  'AIza[0-9A-Za-z_-]{30,}',
  'sk-[A-Za-z0-9_-]{20,}',
  'ghp_[A-Za-z0-9]{30,}',
  'github_pat_[A-Za-z0-9_]{20,}',
  'xox[baprs]-[A-Za-z0-9-]{10,}',
  'AKIA[0-9A-Z]{16}',
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
)
# B) Heurística clave=valor (solo documentos)
$softPattern = '(api[_-]?key|secret|password|passwd|token)[[:space:]]*[=:][[:space:]]*["'']?[A-Za-z0-9_+/=-]{16,}'
$docGlobs = @('*.md','*.json','*.yml','*.yaml','*.txt','*.csv','.env.example','.env.production.example','*.example')
# Líneas que NO son secretos reales (placeholders / código)
$noise = '(<|>|\$\{|xxxx|XXXX|placeholder|REDACTED|HIDDEN|contrase..?a de aplicaci..?n|optionalSecret)'

$hard = 0; $soft = 0

function Show-Line($txt) { Write-Host ("    " + ($txt -replace '\s+', ' ').Trim()) }

Write-Host "== A) Patrones duros (arbol rastreado) ==" -ForegroundColor Cyan
foreach ($p in $hardPatterns) {
  $out = git -C $Repo grep -n -i -I -E -e $p 2>$null
  if ($out) { $hard++; Write-Host ("[DURO] " + $p) -ForegroundColor Red; $out | ForEach-Object { Show-Line $_ } }
}
if ($hard -eq 0) { Write-Host "   (sin coincidencias duras)" -ForegroundColor Green }

Write-Host "`n== B) Heuristica clave=valor (solo documentos) ==" -ForegroundColor Cyan
$softOut = git -C $Repo grep -n -i -I -E -e $softPattern -- $docGlobs 2>$null |
  Where-Object { $_ -notmatch $noise }
if ($softOut) {
  $soft += ($softOut | Measure-Object).Count
  Write-Host "[AVISO] posibles valores en documentos:" -ForegroundColor Yellow
  $softOut | Select-Object -First 40 | ForEach-Object { Show-Line $_ }
} else {
  Write-Host "   (sin avisos)" -ForegroundColor Green
}

if ($History) {
  Write-Host "`n== C) Historial completo (patrones DUROS) ==" -ForegroundColor Cyan
  $revs = git -C $Repo rev-list --all
  Write-Host ("   Revisando " + ($revs | Measure-Object).Count + " commits...")
  foreach ($rev in $revs) {
    foreach ($p in $hardPatterns) {
      $out = git -C $Repo grep -l -i -I -E -e $p $rev 2>$null
      if ($out) { $hard++; $short = (git -C $Repo rev-parse --short $rev); Write-Host ("[DURO] " + $short + "  " + $p) -ForegroundColor Red; $out | ForEach-Object { Show-Line $_ } }
    }
  }
  if ($hard -eq 0) { Write-Host "   (sin patrones duros en el historial)" -ForegroundColor Green }
}

Write-Host ""
if ($hard -gt 0) { Write-Host "RESULTADO: hallazgos DUROS. Revisar." -ForegroundColor Red; exit 1 }
elseif ($soft -gt 0) { Write-Host "RESULTADO: sin duros; hay avisos suaves (revisar arriba)." -ForegroundColor Yellow; exit 2 }
else { Write-Host "RESULTADO: limpio." -ForegroundColor Green; exit 0 }
