---
name: gws-security-hardening
description: "Usar este skill OBLIGATORIAMENTE antes de proponer, escribir o revisar cualquier cambio que toque: integraciones de pago, credenciales/API keys, configuración de Docker/contenedores, conexiones MCP nuevas, endpoints de autenticación, permisos de agentes de IA (Verdent u otros), o cualquier archivo bajo rutas de secretos/infraestructura. Activar también si una IA o agencia externa propone un cambio en cualquiera de estas 'bocas de conexión'. Si un cambio propuesto no pasa este checklist, no se aplica sin decisión explícita de Jorge documentada."
---

# GWS · Checklist de Hardening — Bocas de Conexión

## Alcance de este skill

"Boca de conexión" = cualquier punto donde GWS habla con un sistema
externo o maneja una credencial: procesador de pago, API de terceros
(NVIDIA, servicios de IA), conexiones MCP, autenticación de usuarios,
wallets internos, y la interfaz entre agentes de IA y el código de
producción.

Este skill no reemplaza una auditoría de seguridad profesional externa
antes del lanzamiento — es el filtro de primera línea para no introducir
errores obvios durante el desarrollo día a día.

## Checklist — correr esto ANTES de aplicar el cambio

### 1. Credenciales y secretos

- [ ] ¿El cambio introduce alguna API key, token o contraseña en texto
      plano en algún archivo del repositorio? → Si sí, DETENER. Debe ir a
      variable de entorno + gestor de secretos, nunca al código.
- [ ] ¿Esta credencial ya existió expuesta antes en algún archivo
      compartido con otra IA o subida a un chat? → Si sí, debe rotarse
      (regenerarse), no solo moverse de lugar. Una key que estuvo expuesta
      sigue siendo válida hasta que se revoca explícitamente.
- [ ] ¿La credencial nueva tiene el mínimo permiso necesario (principio de
      menor privilegio), o se le está dando acceso amplio "por las dudas"?

### 2. Zona de Exclusión (ver CLAUDE.md §3.1)

- [ ] ¿Este cambio le da a algún agente de IA (Verdent u otro) acceso de
      lectura o escritura a `Payment_Vault`? → Si sí, DETENER. No está
      permitido bajo ninguna circunstancia sin cambiar primero la regla en
      CLAUDE.md, con decisión explícita de Jorge.
- [ ] ¿El cambio permite que un agente ejecute, sin confirmación humana en
      el momento, algo que modifique tarifas, comisiones o términos de
      suscripción? → Si sí, DETENER. Ver CLAUDE.md §3.1: preparar y
      notificar, nunca ejecutar solo.
- [ ] ¿El cambio toca configuración raíz del servidor (llaves SSH,
      estructura de directorios de producción)? → Si sí, verificar que
      ningún agente de IA tenga las credenciales para aplicarlo por sí
      mismo.

### 3. Pagos

- [ ] ¿El backend de GWS llega a tocar o almacenar un número de tarjeta
      real en algún punto del flujo? → Si sí, DETENER y rediseñar: usar
      checkout alojado del procesador (Mercado Pago/Stripe) para que esos
      datos nunca lleguen a la infraestructura propia.
- [ ] ¿El cambio en el motor de split payment (`SplitRuleEngine`,
      `SettlementService`) fue probado en staging con datos de prueba antes
      de considerarse para producción?
- [ ] ¿Existe un registro (ledger) inmutable de la transacción antes y
      después del cambio, para poder auditar si algo salió mal?

### 4. Contenedores y despliegue

- [ ] ¿El contenedor `Ops_Agent_Space` (Verdent) tiene, después de este
      cambio, alguna ruta de red o de sistema de archivos hacia
      `Payment_Vault`? → Si sí, DETENER, el aislamiento está roto.
- [ ] ¿Este cambio se aplica directo a producción, o pasa primero por
      staging con despliegue progresivo (canary)? Ver CLAUDE.md §3.4.
- [ ] ¿Está definido el mecanismo de rollback antes de aplicar el cambio?
      Si la respuesta es "no sé cómo revertir esto", no se aplica todavía.

### 5. Conexiones MCP / integraciones nuevas

- [ ] ¿Esta conexión MCP nueva es realmente necesaria, o se está agregando
      "por si acaso"? (Cada conexión es una superficie de ataque adicional.)
- [ ] ¿Qué datos puede leer/escribir esta conexión? ¿Se limitó
      explícitamente el alcance, o tiene acceso amplio por defecto?

### 6. Kill switch ("Código Rojo")

- [ ] ¿El mecanismo de emergencia revoca credenciales reales (API keys,
      tokens OAuth) desde el lado de infraestructura, o depende de que el
      agente "reciba la orden y se detenga"? Solo la primera opción es
      válida (ver CLAUDE.md §3.3).

## Qué hacer si un cambio falla el checklist

No se "arregla en el momento" ni se aplica "por esta vez nomás". Se
documenta el punto de falla, se lleva a Jorge como decisión explícita, y no
se procede hasta tener una respuesta clara — igual que cualquier otro
punto de gobernanza de este proyecto.
