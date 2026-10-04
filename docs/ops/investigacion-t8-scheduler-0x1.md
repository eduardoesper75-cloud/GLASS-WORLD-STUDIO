# T8 · Scheduler opencode — diagnóstico del `0x1`

**Fecha:** 2026-10-03
**Autorizado por:** Jorge (P4 de la orden del 03/10)
**Estado:** **causa raíz identificada.** Corrección propuesta, **NO aplicada**.
**Alcance:** solo lectura del scheduler y de las tareas. No se modificó ninguna
tarea, ni `auth.json`, ni configuración de opencode.

---

## 1. Resumen

Las tareas del scheduler fallan. **No es un problema del scheduler.**

El proceso `opencode.exe` **arranca correctamente** y muere durante la llamada al
proveedor de modelo con:

```
Error: invalid access token or token expired
```

**Causa raíz refinada (ver §2.7):** el scheduler corre con el proveedor
**`qwen-code`**, cuya credencial está expirada. La sesión interactiva corre con
**`opencode/big-pickle`** y funciona. No es que "falten credenciales": es que
**falta la de un proveedor concreto**.

| Código | Significado | Qué significa aquí |
|---|---|---|
| `0x1` | el proceso arrancó y salió con error | El proveedor `qwen-code` rechazó el token |
| `0x80070002` | `ERROR_FILE_NOT_FOUND` | Resultado **viejo** (02/10), la tarea no volvió a dispararse |
| `0x800710E0` | `ERROR_REQUEST_REFUSED` | Task Scheduler **rechazó lanzar** el proceso (§2.8) |

---

## 2. Evidencia

### 2.1 Reproducción del fallo

Ejecutando **exactamente** el comando que usa la tarea, desde su
`WorkingDirectory`, capturing salida y error:

```powershell
$exe="C:\Users\user\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe"
Start-Process -FilePath $exe `
  -ArgumentList 'run','--','Lee y ejecuta ledger/scheduler/prompts/revision-correo-urgente.md ...' `
  -WorkingDirectory "F:\Downloads\GLASS-WORLD-STUDIO-main" `
  -RedirectStandardOutput "$env:TEMP\oc-out.txt" `
  -RedirectStandardError "$env:TEMP\oc-err.txt"
```

**Resultado:**

```
> build · vision-model
Error: invalid access token or token expired
```

El proceso **no falla al arrancar**: falla al llamar al modelo. Por eso el
código de salida es `1` y no `0x80070002`.

### 2.2 Descripción del fallo, descartando otras hipótesis

| Comprobación | Resultado |
|---|---|
| `opencode.exe` existe | Sí, 180.599.176 bytes |
| `opencode.exe --version` | `1.18.34` — el binario funciona |
| `WorkingDirectory` existe | Sí |
| Los 4 prompts maestros existen y son legibles | Sí (1.181-1.625 bytes cada uno) |
| `node` en PATH | `C:\Program Files\nodejs\node.exe` |
| Carpetas `locks` de opencode | **Vacías** — no hay jobs bloqueados |
| `runs` de opencode | **Vacía** — ningún run llegó a registrarse |
| Variables de auth en entorno | **Ninguna** relevante |

### 2.3 Las 4 tareas son idénticas en configuración

Extraído con `Get-ScheduledTask` para las cuatro:

```
Principal : user | logon=Interactive | runLevel=Limited
Execute   : C:\Users\user\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe
WorkingDirectory : F:\Downloads\GLASS-WORLD-STUDIO-main
MultipleInstances : IgnoreNew
Enabled   : True
ExecutionTimeLimit : PT72H
```

Idénticas salvo los `Arguments` (que solo cambian el nombre del prompt).
**No hay diferencia de configuración entre las que fallan y las que no.**

### 2.4 La diferencia real: cuándo corrieron

| Tarea | Último run | Resultado |
|---|---|---|
| tropa-escaneo-mercado-global | **03/10 00:00** | `0x1` |
| tropa-revision-correo-urgente | **03/10 02:00** | `0x1` |
| tropa-reporte-diario-tropa | 02/10 20:00 | `0x80070002` |
| tropa-seguimiento-postulaciones | 02/10 14:00 | `0x80070002` |

**Las dos que devuelven `0x1` son exactamente las que corrieron hoy** (después de
la reparación del 02/10). Las dos que conservan `0x80070002` son las que su
próxima ejecución es a las 14:00 y 20:00, o sea **todavía no INTENTAN correr**.

Por lo tanto `0x80070002` y `0x1` son **dos fallos distintos**:

- `0x80070002` (ERROR_FILE_NOT_FOUND): la reparación del 02/10 no cubrió estas dos
  tareas, o su error es de otra naturaleza. **Sin resolver.**
- `0x1`: el proceso arranca y el **proveedor de modelo rechaza el token**.

### 2.5 El token

`auth.json` contiene un único proveedor, tipo `api`, clave con formato `sk-...`.
**No es un JWT**, así que no lleva `exp` embebido y no se puede verificar la
expiración sin llamar a la API del proveedor. Lo que sabemos es empírico: el
proveedor responde `invalid access token or token expired`.

**Nota de seguridad:** no se leyó ni se registró el valor de la clave en ningún
log. Solo su longitud y prefijo.

### 2.6 Configuración de modelo

`C:\Users\user\.config\opencode\opencode.jsonc` **no contiene ninguna clave
`model`, `provider`, `baseURL` ni `apiKey`** (verificado por grep: 0 coincidencias).
Por eso opencode cae en su modelo por defecto, `vision-model`, que **requiere
credenciales de proveedor configuradas**.

### 2.7 La causa raíz real: el proveedor es `qwen-code`, no el de la sesión

En `opencode.log` cada intento registra `providerID` y `modelID`. Ahí está la
evidencia que cierra el caso:

| Ejecución | run | provider / model | Resultado |
|---|---|---|---|
| 00:00 (scheduler) | `fe326e58`, `12776d5b` | `qwen-code` / `vision-model` | **stream error** |
| 02:00 (scheduler) | `c7b8f72c` | `qwen-code` / `vision-model` | **stream error** |
| 02:13 (prueba manual) | `e5f670df`, `49fdcfa4` | `qwen-code` / `vision-model` | **stream error** |
| sesión interactiva | `78a9a87c` | `opencode` / **`big-pickle`** | **funciona** |

**La sesión interactiva usa un proveedor distinto al que usa el scheduler, y el
de la sesión funciona.** Por eso el diagnóstico correcto no es "el token de
opencode venció", sino: **la credencial del proveedor `qwen-code` está
expirada o revocada.**

De dónde sale: no hay variables de entorno `QWEN*`, `DASHSCOPE*`, `OPENAI*`,
`ANTHROPIC*`, `OPENROUTER*` ni `GEMINI*` definidas, así que `qwen-code` resuelve
su credencial por el mecanismo interno de opencode, respaldado en
`C:\Users\user\.local\share\opencode\auth.json` (proveedor tipo `api`, clave con
prefijo `sk-`).

> **Corrección a una hipótesis anterior.** Se sospechó que el proceso
> `opencode.exe` PID 12712 (creado 02/10 21:13) era un job huérfano del
> scheduler reteniendo el scope. **Es falso:** ese PID es la sesión
> interactiva en la que corre esta misma investigación. Su hora de creación
> 21:13 coincide con el primer `timestamp` del `run=78a9a87c` en el log.

### 2.8 El `0x800710E0` de las 12:33 es un fallo distinto

A las **12:33** del 03/10 ambas tareas que sí tienen schedule de horas pares
(`0 */2` y `0 */4`) se dispararon en un horario que **no** corresponde a
su trigger, y devolvieron `0x800710E0` = `ERROR_REQUEST_REFUSED`: Task Scheduler
**rechazó la solicitud de ejecución**, sin llegar a crear el proceso. En el log
**no hay ninguna entrada** de proveedor a esa hora, lo que confirma que el
proceso ni arrancó.

Lectura conservadora: hay una instancia de opencode viva en la sesión
interactiva que interactúa con el registro de tareas del scope, y Task Scheduler
terminó rechazando el disparo. **No se modificó nada para confirmarlo**, porque
requiere tocar el registro de tareas y está fuera de lo autorizado. Queda como
**pendiente de confirmar**, no como causa establecida.

`NumberOfMissedRuns = 0` en las cuatro: no hubo triggers perdidos, lo que
descarta la causa "estaba dormido y no recuperó la corrida".

---

## 3. Causa raíz

> **La tarea del scheduler está correctamente configurada. El fallo es de
> autenticación: la credencial del proveedor `qwen-code` — el que usa el
> scheduler — está expirada o revocada.**

Evidencia convergente:

1. El error exacto lo produce el cliente del proveedor, no el scheduler.
2. **La sesión interactiva, con otro proveedor (`opencode/big-pickle`), funciona
   sobre los mismos binario, scope y prompts** — luego el problema no es de
   entorno ni de instalación.
3. La configuración de las 4 tareas es idéntica — no puede explicar la diferencia.
4. Los paths, prompts, locks y binario están todos correctos.
5. `runs` está vacío porque **nunca se llegó a registrar una ejecución**.

---

## 4. Solución propuesta (NO APLICADA)

Es una acción de **credenciales**, no de código. Toca un secreto, así que **no la
ejecuto sin confirmación explícita de Jorge** (CLAUDE.md §3.1: cero acceso a
credenciales por parte de agentes de IA).

### 4.1 Opción A — Reautenticar el proveedor `qwen-code` (recomendada)

Es lo que la evidencia pide: la credencial que falla es la de `qwen-code`.
**Lo debe hacer Jorge interactuando con su sesión**, no el agente:

```
opencode auth login
```

Verificación posterior (debe responder texto, no `invalid access token`):

```powershell
Push-Location "F:\Downloads\GLASS-WORLD-STUDIO-main"
& "C:\Users\user\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe" run -- "responde: ok"
Pop-Location
```

### 4.2 Opción B — Fijar modelo y proveedor en `opencode.jsonc`

Hoy las tareas dependen del **modelo por defecto** (`vision-model`), lo que las ata
a un proveedor frágil y además es una peor elección para un job de textos: más
caro y más lento. Fijar el proveedor hace que el scheduler **deje de depender del
default**:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle"
}
```

El valor propuesto es el mismo proveedor/modelo que **ya está funcionando** en la
sesión interactiva (§2.7), así que no introduce un proveedor nuevo ni
desconocido.

**El agente no escribe credenciales en ese archivo.** Si el proveedor elegido
requiere clave, va por variable de entorno o gestor de secretos, nunca en el
archivo (CLAUDE.md §5).

### 4.3 Complemento — habilitar log de diagnóstico

El log `Microsoft-Windows-TaskScheduler/Operational` está **deshabilitado**
(`IsEnabled = False`). Por eso no hay trace por ejecución y hubo que reproducir
a mano. Habilitarlo da el siguiente fallo con contexto:

```powershell
wevtutil sl Microsoft-Windows-TaskScheduler/Operational /e:true
```

Es reversible (`/e:false`) y no contiene secretos. **Fue clave en este
diagnóstico haber podido leer `opencode.log`**: ahí estaba `providerID`.

---

## 5. Lo que sigue pendiente (no resuelto por este diagnóstico)

1. **`0x800710E0` (12:33).** Task Scheduler rechazó el disparo sin crear el
   proceso. No se investigó a fondo porque exige tocar el registro de tareas
   (§2.8). **Pendiente, no resuelto.**
2. **`0x80070002` en 2 tareas.** Resultado viejo del 02/10; esas tareas no se
   dispararon desde entonces (`next` 14:00 y 20:00). Si se arregla la
   autenticación, chances de que reaparezcan.
3. **Verificación post-fix.** Sin reautenticar no se puede confirmar nada.
4. **Contenido de los reportes.** `runs` está vacía: no hay ningún reporte de
   scheduler desde el 02/10.

---

## 6. Reproducir

```powershell
# Ver estado
Get-ScheduledTask -TaskPath "\OpenCode\*" |
  Select-Object TaskName, State,
    @{n='LastRun';e={(Get-ScheduledTaskInfo $_.TaskName -TaskPath $_.TaskPath).LastRunTime}},
    @{n='Result';e={'0x{0:X}' -f (Get-ScheduledTaskInfo $_.TaskName -TaskPath $_.TaskPath).LastTaskResult}}

# Reproducir el fallo de una tarea concreta (mismo comando, mismo directorio)
Push-Location "F:\Downloads\GLASS-WORLD-STUDIO-main"
& "C:\Users\user\AppData\Roaming\npm\node_modules\opencode-ai\bin\opencode.exe" run -- "di hola"
Pop-Location
# -> Error: invalid access token or token expired
```

## 7. Nota de trazabilidad

Este diagnóstico **no modificó** ninguna tarea del scheduler, ni `auth.json`, ni
`opencode.jsonc`. Los cambios propuestos en §4 requieren acción de Jorge.