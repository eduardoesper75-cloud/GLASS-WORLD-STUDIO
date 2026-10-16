<#
.SYNOPSIS
  Adopta el historial saneado (bundle de scrub-git-history.ps1) en el repo EN VIVO,
  preservando el trabajo sin commitear mediante stash, y purga los objetos viejos.

.DESCRIPTION
  Por defecto corre en modo PREFLIGHT (no cambia nada). Con -Execute aplica:
    1) bundle de seguridad del repo en vivo;
    2) `git stash push -u` del trabajo pendiente (si hay);
    3) fetch del bundle saneado + swap de la rama (`main`);
    4) `git stash pop` para restaurar el trabajo pendiente;
    5) `reflog expire --expire=now --all` + `gc --prune=now` (borra los objetos con secretos);
    6) verificación final.

  Seguridad: aborta si el árbol del HEAD en vivo NO coincide con el del HEAD saneado
  (en ese caso restaura rama y stash).

.PARAMETER Repo
  Ruta del repositorio en vivo (default: directorio actual).
.PARAMETER Bundle
  Bundle saneado. Default: el `gws-scrubbed-*.bundle` mas reciente en OutDir.
.PARAMETER OutDir
  Carpeta de artefactos (default: %LOCALAPPDATA%\Temp\opencode\gws-scrub).
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
$tempRef = 'refs/heads/_gws_scrubbed'

# ---- Resolver bundle --------------------------------------------------------
if (-not $Bundle) {
  $Bundle = (Get-ChildItem $OutDir -Filter 'gws-scrubbed-*.bundle' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}
if (-not $Bundle -or -not (Test-Path $Bundle)) { throw "No se encontro el bundle saneado en '$OutDir'." }

$liveHead = git -C $Repo rev-parse --short $Branch
$liveCommits = (git -C $Repo rev-list --count $Branch)
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
  Write-Host ("  powershell -ExecutionPolicy Bypass -File tools/security/adopt-scrubbed-history.ps1 -Execute") -ForegroundColor Yellow
  exit 0
}

# ---- 1) Backup del repo en vivo --------------------------------------------
$backup = Join-Path $OutDir ("backup-antes-de-adopt-" + $stamp + ".bundle")
git -C $Repo bundle create $backup --all | Out-Null
Write-Host ("`n[1/6] Respaldo: " + $backup) -ForegroundColor Green

# ---- 2) Stash del trabajo pendiente ----------------------------------------
$stashed = $false
if ($dirty.Count -gt 0) {
  git -C $Repo stash push -u -m "pre-scrub-$stamp" | Out-Null
  $stashed = $true
  Write-Host "[2/6] Trabajo pendiente guardado en stash (pre-scrub-$stamp)." -ForegroundColor Green
} else {
  Write-Host "[2/6] Arbol limpio: sin stash." -ForegroundColor Green
}

# ---- 3) Fetch + verificacion + swap ----------------------------------------
try {
  git -C $Repo fetch --quiet $Bundle ("refs/heads/${Branch}:$tempRef")
  $scrubSha = git -C $Repo rev-parse --short $tempRef
  $liveTree = git -C $Repo rev-parse "$Branch^{tree}"
  $scrubTree = git -C $Repo rev-parse "$tempRef^{tree}"
  $scrubCommits = (git -C $Repo rev-list --count $tempRef)
  Write-Host ("[3/6] Saneado: HEAD " + $scrubSha + " (" + $scrubCommits + " commits)") -ForegroundColor Green

  if ($liveTree -ne $scrubTree) {
    throw "El arbol del HEAD saneado NO coincide con el HEAD en vivo (arbol en vivo=$liveTree, saneado=$scrubTree). Se aborta para no perder cambios."
  }
  Write-Host "      Arbol identico (solo cambia el contenido de commits viejos). OK." -ForegroundColor Green

  git -C $Repo checkout --force $tempRef | Out-Null
  git -C $Repo branch -M $Branch | Out-Null
} catch {
  Write-Host ("ERROR durante el swap: " + $_.Exception.Message) -ForegroundColor Red
  git -C $Repo checkout --force $Branch 2>$null | Out-Null
  if ($stashed) { git -C $Repo stash pop 2>$null | Out-Null }
  throw "Swap revertido. Nada se perdio."
}

# ---- 4) Restaurar trabajo pendiente ----------------------------------------
if ($stashed) {
  git -C $Repo stash pop | Out-Null
  Write-Host "[4/6] Trabajo pendiente restaurado (stash pop)." -ForegroundColor Green
} else {
  Write-Host "[4/6] Nada que restaurar." -ForegroundColor Green
}

# ---- 5) Purga de objetos viejos (los que tenian secretos) ------------------
git -C $Repo reflog expire --expire=now --all | Out-Null
git -C $Repo gc --prune=now --quiet | Out-Null
Write-Host "[5/6] Reflog expirado + gc: objetos con secretos purgados." -ForegroundColor Green

# ---- 6) Verificacion --------------------------------------------------------
$newHead = git -C $Repo rev-parse --short $Branch
$newCommits = (git -C $Repo rev-list --count $Branch)
$dirtyAfter = @(git -C $Repo status --porcelain)
Write-Host "[6/6] Verificacion:" -ForegroundColor Green
Write-Host ("      HEAD " + $Branch + " = " + $newHead + " (" + $newCommits + " commits)")
Write-Host ("      Cambios pendientes preservados: " + $dirtyAfter.Count + " (antes: " + $dirty.Count + ")")
git -C $Repo branch --list $tempRef

Write-Host "`nLISTO. Historial saneado adoptado en el repo en vivo." -ForegroundColor Green
Write-Host ("Respaldo (por si acaso): " + $backup) -ForegroundColor Yellow
