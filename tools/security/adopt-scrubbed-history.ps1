<#
.SYNOPSIS
  Adopta el historial saneado (bundle de scrub-git-history.ps1) en el repo EN VIVO,
  preservando el trabajo sin commitear mediante stash, y purga los objetos viejos.

.DESCRIPTION
  Por defecto corre en modo PREFLIGHT (no cambia nada). Con -Execute aplica:
    1) bundle de seguridad del repo en vivo;
    2) `git stash push -u` del trabajo pendiente (si hay);
    3) fetch del bundle + swap de la rama (`checkout -B`);
    4) `git stash pop` para restaurar el trabajo pendiente;
    5) `reflog expire --expire=now --all` + `gc --prune=now` (borra los objetos con secretos);
    6) verificación final.

  Seguridad: aborta (y restaura rama + stash) si el árbol del HEAD saneado NO coincide
  con el del HEAD en vivo, o si cualquier comando git falla. Usa Invoke-Git, que SÍ
  detecta errores de comandos nativos (los `| Out-Null` no lo hacían).

.PARAMETER Repo
  Ruta del repositorio en vivo (default: directorio actual).
.PARAMETER Bundle
  Bundle saneado. Default: el `gws-scrubbed-*.bundle` mas reciente en OutDir.
.PARAMETER OutDir
  Carpeta de artefactos (default: $env:LOCALAPPDATA\Temp\opencode\gws-scrub).
.PARAMETER Branch
  Rama a reescribir (default: main).
.PARAMETER Execute
  Aplica los cambios. Sin este switch, solo muestra el plan (preflight).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/security/adopt-scrubbed-history.ps1
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools/security/adopt-scrubbed-history.ps1 -Execute
#>
[CmdletBinding()]
param(
  [string]$Repo = (Get-Location).Path,
  [string]$Bundle = '',
  [string]$OutDir = (Join-Path $env:LOCALAPPDATA 'Temp\opencode\gws-scrub'),
  [string]$Branch = 'main',
  [switch]$Execute
)

$ErrorActionPreference = 'Stop'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$tempRef = '_gws_scrubbed'

# Ejecuta git y LANZA si falla (a diferencia de `git ... | Out-Null`).
function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  $out = & git -C $Repo @GitArgs 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw ("git " + ($GitArgs -join ' ') + " fallo (exit " + $LASTEXITCODE + "): " + ($out -join ' | '))
  }
  return $out
}

# ---- Resolver bundle --------------------------------------------------------
if (-not $Bundle) {
  $Bundle = (Get-ChildItem $OutDir -Filter 'gws-scrubbed-*.bundle' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}
if (-not $Bundle -or -not (Test-Path $Bundle)) { throw "No se encontro el bundle saneado en '$OutDir'." }

$liveHead = (Invoke-Git rev-parse --short $Branch)
$liveTree = (Invoke-Git rev-parse "$Branch^{tree}")
$liveCommits = (Invoke-Git rev-list --count $Branch)
$dirty = @(git -C $Repo status --porcelain)
$untracked = @(git -C $Repo ls-files --others --exclude-standard)

Write-Host "===== PREFLIGHT - adopcion de historial saneado =====" -ForegroundColor Cyan
Write-Host ("Repo          : " + $Repo)
Write-Host ("Bundle        : " + $Bundle)
Write-Host ("Rama          : " + $Branch + "  (HEAD " + $liveHead + ", " + $liveCommits + " commits)")
Write-Host ("Cambios pendientes : " + $dirty.Count + " (untracked: " + $untracked.Count + ")")
Write-Host "`nRefs del bundle saneado:"
git -C $Repo bundle list-heads $Bundle | ForEach-Object { Write-Host ("  " + $_) }

if (-not $Execute) {
  Write-Host "`n[PREFLIGHT] No se modifico nada." -ForegroundColor Yellow
  Write-Host "Para aplicar:" -ForegroundColor Yellow
  Write-Host "  powershell -ExecutionPolicy Bypass -File tools/security/adopt-scrubbed-history.ps1 -Execute" -ForegroundColor Yellow
  exit 0
}

# ---- 1) Backup del repo en vivo --------------------------------------------
$backup = Join-Path $OutDir ("backup-antes-de-adopt-" + $stamp + ".bundle")
Invoke-Git bundle create $backup --all | Out-Null
Write-Host ("`n[1/6] Respaldo: " + $backup) -ForegroundColor Green

# ---- 2) Stash del trabajo pendiente ----------------------------------------
$stashed = $false
if ($dirty.Count -gt 0) {
  Invoke-Git stash push -u -m "pre-scrub-$stamp" | Out-Null
  $stashed = $true
  Write-Host "[2/6] Trabajo pendiente guardado en stash (pre-scrub-$stamp)." -ForegroundColor Green
} else {
  Write-Host "[2/6] Arbol limpio: sin stash." -ForegroundColor Green
}

# ---- 3) Fetch + verificacion + swap ----------------------------------------
try {
  Invoke-Git fetch --quiet $Bundle ("refs/heads/${Branch}:refs/heads/$tempRef") | Out-Null
  $scrubSha = (Invoke-Git rev-parse --short $tempRef)
  $scrubTree = (Invoke-Git rev-parse "$tempRef^{tree}")
  $scrubCommits = (Invoke-Git rev-list --count $tempRef)
  Write-Host ("[3/6] Saneado: HEAD " + $scrubSha + " (" + $scrubCommits + " commits)") -ForegroundColor Green

  if ($liveTree -ne $scrubTree) {
    throw "El arbol del HEAD saneado NO coincide con el HEAD en vivo. Se aborta para no perder cambios."
  }
  Write-Host "      Arbol identico (solo cambia el contenido de commits viejos). OK." -ForegroundColor Green

  # checkout -B: resetea $Branch al commit saneado y lo pone como rama actual (NO detached).
  Invoke-Git checkout --force -B $Branch $tempRef | Out-Null
  Invoke-Git update-ref -d ("refs/heads/$tempRef") | Out-Null
} catch {
  Write-Host ("ERROR durante el swap: " + $_.Exception.Message) -ForegroundColor Red
  git -C $Repo checkout --force $Branch 2>$null | Out-Null
  if ($stashed) { git -C $Repo stash pop 2>$null | Out-Null }
  throw "Swap revertido. Nada se perdio."
}

# ---- 4) Restaurar trabajo pendiente ----------------------------------------
if ($stashed) {
  Invoke-Git stash pop | Out-Null
  Write-Host "[4/6] Trabajo pendiente restaurado (stash pop)." -ForegroundColor Green
} else {
  Write-Host "[4/6] Nada que restaurar." -ForegroundColor Green
}

# ---- 5) Purga de objetos viejos (los que tenian secretos) ------------------
Invoke-Git reflog expire --expire=now --all | Out-Null
Invoke-Git gc --prune=now --quiet | Out-Null
Write-Host "[5/6] Reflog expirado + gc: objetos con secretos purgados." -ForegroundColor Green

# ---- 6) Verificacion --------------------------------------------------------
$newHead = (Invoke-Git rev-parse --short $Branch)
$newCommits = (Invoke-Git rev-list --count $Branch)
$dirtyAfter = @(git -C $Repo status --porcelain)
Write-Host "[6/6] Verificacion:" -ForegroundColor Green
Write-Host ("      HEAD " + $Branch + " = " + $newHead + " (" + $newCommits + " commits)")
Write-Host ("      Cambios pendientes preservados: " + $dirtyAfter.Count + " (antes: " + $dirty.Count + ")")
Write-Host ("      Rama actual: " + (git -C $Repo symbolic-ref --short -q HEAD))

Write-Host "`nLISTO. Historial saneado adoptado en el repo en vivo." -ForegroundColor Green
Write-Host ("Respaldo (por si acaso): " + $backup) -ForegroundColor Yellow
