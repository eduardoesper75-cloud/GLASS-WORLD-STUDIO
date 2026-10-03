# ALERTA DE SEGURIDAD — 02/10/2026

> **Este documento NO ejecuta ninguna acción.** Es un aviso. Todo lo que
> requiere hacer aquí lo tiene que hacer **Jorge manualmente**.
> Nada se borró, se movió ni se rotó. Ningún agente de IA tiene autorización
> para tocar credenciales de terceros (`CLAUDE.md` §3.1: "Cero acceso a
> credenciales de tesorería... ninguna IA conoce ni puede leer las API keys").

---

## 1. Archivos con credenciales en texto plano

Detectados en `F:\Documents\`:

| Archivo | Bytes | Fecha de modificación |
|---|---:|---|
| `paypal.txt` | 82 | 2026-08-06 |
| `NVIDIA.txt` | 70 | 2026-08-13 |
| `SENTRY.txt` | 526 | 2026-08-14 |

**El contenido de estos archivos no se muestra en ningún documento del
repositorio, ni se incluye en ningún commit, ni aparece en este informe.**
Se verificó únicamente existencia, tamaño y fecha.

> **Corrección a un informe anterior:** el informe del 02/10 afirmó que
> `C:\Users\user\paypal.txt` (108 bytes, 16/08) contenía
> credenciales reales de PayPal. Un análisis estructural posterior
> (recuento de tipos de carácter, sin leer valores) determinó que **no las
> contiene**: no hay `=`, `:`, `@`, `/` ni las cadenas `paypal`, `client`,
> `secret`, `bearer`, `token` o `api` en el archivo. Era un **falso positivo**.
> Este informe se refiere al archivo de `F:\Documents\`, que sí merece revisión.

---

## 2. Verificaciones hechas sin tocar los archivos

| Verificación | Resultado |
|---|---|
| `F:\OneDrive` existe | **No** |
| `F:\Documents` es repositorio git | **No** |
| Contenido visible en el repositorio GWS | **No** — `.gitignore` cubre `paypal.txt`, `*.secret`, `*.credentials`, `*.pem`, `*.key` (verificado con `git check-ignore` el 2026-10-02) |
| Riesgo de que el repositorio GWS los exponga | **Bajo** |

**Riesgo residual:** `F:\Documents\` **no está en la nube y no está en git**,
lo cual es una buena noticia. Pero sigue siendo texto plano en un disco de
la máquina, sin cifrado, accesible a cualquier cuenta que abra sesión en la
PC y a cualquier software que lea el disco.

---

## 3. Acción requerida por Jorge (NO automatizable)

En este orden. El paso 6 solo tiene sentido después del 5.

1. **Rotar la credencial de PayPal.** Entrar a las opciones de developer de
   la cuenta, revocar el secreto actual y generar uno nuevo.
2. **Rotar la API key de NVIDIA.** account.nvidia.com → API keys.
3. **Rotar el DSN/token de Sentry.** Sentry → Project Settings → Client Keys.
4. **Verificar en cada servicio si hubo uso anómalo.** PayPal y
   NVIDIA tienen registro de actividad; revisar antes de rotar ayuda a
   saber si el archivo estuvo expuesto.
5. **Borrar los 3 archivos de `F:\Documents\`.** Solo después de haber
   guardado las credenciales nuevas en un gestor de contraseñas.
6. **Guardar las nuevas credenciales en un gestor de contraseñas**
   (Bitwarden, 1Password o equivalente). **No volver a crear archivos de
   texto plano.** Este es el paso que evita que el problema se repita.
7. **Verificar que `F:\Documents\` no esté sincronizada** con OneDrive,
   Google Drive o Dropbox. Hoy no lo está, confirmado. Si alguna vez se
   conecta una carpeta de sincronización a nivel de `F:\`, considerar que
   cualquier archivo plano de esa unidad queda en la nube.

---

## 4. Razón

Riesgo de fraude y de cargo no autorizado si alguien accede a la PC, o si
la carpeta se sincroniza con la nube en el futuro. Los tres archivos tienen
entre 3 y 4 semanas de antigüedad y ninguna está cifrada.

`CLAUDE.md` §5 lo dice sin rodeos:

> "Ningún archivo de configuración con API keys o secretos en texto plano,
> bajo ninguna circunstancia. Usar variables de entorno + gestor de
> secretos, nunca commitear `.env` con valores reales."

La regla existe. Estos tres archivos la incumplen.

---

## 5. Lo que este agente NO hizo y por qué

| Acción no realizada | Motivo |
|---|---|
| Leer y mostrar el contenido de los 3 archivos | Regla crítica 1 del encargo + `CLAUDE.md` §3.1 |
| Borrar los archivos | **No autorizado.** Solo Jorge |
| Rotar las credenciales | **No automatizable desde esta sesión**, y la rotación requiere acceso a las cuentas |
| Mover los archivos a un gestor de contraseñas | Requiere la clave maestra de Jorge |

---

## 6. Pendiente dentro del proyecto (esto sí está en el repo)

Este hallazgo es de `F:\Documents\`. Dentro del repositorio GWS hay un
problema **más grave** que encontró la FASE 11 y que sí está en código
versionado — ver `docs/simulation/analisis-fase-11.md` §3:

> **El rate limiting del backend es 1.000× más débil de lo documentado.**
> `@nestjs/throttler` v6 interpreta `ttl` en milisegundos y
> `src/app.module.ts:40` le pasa `60` creyendo que son segundos. Medido:
> **2.927 req/s medidos contra un techo pretendido de 1,7 req/s**. El mismo
> bug está en los seis decoradores `@Throttle` de
> `src/auth/auth.controller.ts`, que dicen "5 intentos de login por
> minuto" y permiten ~83 por segundo.

Eso significa que hoy **no hay defensa efectiva contra fuerza bruta sobre
`/auth/login`**. Es prioridad por encima de los tres archivos de texto plano,
porque es código en producción camino a producción y está a una línea de
distancia de ser explotado.

**Bloqueante B12.** Corrección propuesta: `ttl: ... ?? 60) * 1000` en
`app.module.ts:40` y `ttl: 60_000` en los decoradores de
`auth.controller.ts`. No se aplicó porque la instrucción era medir, no
modificar política de seguridad.
