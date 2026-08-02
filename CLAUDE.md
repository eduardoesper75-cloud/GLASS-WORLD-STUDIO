# CLAUDE.md — Glass World Studio (GWS)

> Este archivo es leído automáticamente por Claude Code al iniciar cualquier
> sesión sobre este repositorio. Es la única fuente de verdad del proyecto.
> Si otra IA (Verdent u otra) opera sobre este código, debe leer este
> archivo antes de proponer o aplicar cualquier cambio.
>
> Última revisión: ver historial de Git de este archivo.
> Mantenido por: Jorge Eduardo Esper (Comandante en Jefe / Founder, GWS).

---

## 1. Qué es GWS (resumen ejecutivo)

Glass World Studio es una plataforma digital integral para el universo del
vidrio: comercio, formación, comunidad, exhibición, información técnica e
innovación, organizados en **6 Galaxias** + 2 sistemas transversales.

| Galaxia | Función | Estado en este repo |
|---|---|---|
| G1 · Íconos Maestros y Vanguardistas del Vidrio | Perfiles de maestros consagrados. Cada maestro gestiona y vende sus propios cursos, talleres, libros/bibliografía especializada, y líneas propias de herramientas o materiales de autor | Prototipado |
| G2 · Marketplace General | Gran mercado central: compraventa de piezas de arte en vidrio, insumos y obras terminadas de toda la comunidad. Radar de proximidad regional | Prototipado |
| G3 · Comunidad | Espacio de interacción social, debates, publicaciones, networking y chat entre artistas y entusiastas | Prototipado |
| G4 · Borosilicato y Envases | Nicho técnico: cristalería de laboratorio, frasquería y borosilicato industrial | Reservado (no construir sin contenido real) |
| G5 · Gran Industria | Soluciones, maquinaria pesada y proveeduría para plantas industriales de vidrio | Reservado |
| G6 · Ingeniería y Oficio | Documentación técnica, normativas de seguridad (MSDS), cálculos de hornos, curvas de recocido (annealing) y transferencia de conocimiento técnico puro | Prototipado (wizard de horno) |
| Satélite de Licitación | Sistema transversal de subastas/licitaciones 72hs | Prototipado (visual) |
| Radar de Oferta/Demanda + Motor Predictivo | Apoyo transversal a todas las Galaxias | Conceptual |

**Regla de alcance**: no construir G4/G5 en profundidad hasta tener contenido
real que mostrar. Un espacio vacío con estética linda es peor que un espacio
que dice honestamente "próximamente" — genera expectativas falsas.

---

## 2. Sistema de diseño (obligatorio, no opcional)

**Ver el Skill `.claude/skills/gws-vetas-de-luz/SKILL.md` para el detalle
completo.** Resumen para referencia rápida:

- Paleta por Galaxia (variables `--g1` a `--g6`), tipografía dual (serif
  itálica para gesto/display + mono para datos técnicos).
- Patrón de fondo **"Vetas de Luz"**: trazas ramificadas que se leen a la vez
  como circuito y como plomo de vitral. Es la fusión conceptual central de la
  marca (tecnología + oficio milenario). No reemplazar por fondos de
  "circuito genérico" ni por imágenes de stock de tecnología.
- Utilidad `.glass` / `.glass-edge` como único sistema de glassmorphism.
  No reinventar `backdrop-filter` por componente.
- **Tokens canónicos (implementables)**: `design-system/gws-design-tokens.css`
  es la fuente ÚNICA de verdad en CSS de esta identidad (paleta por Galaxia,
  `.glass`/`.glass--strong`/`.glass-edge`, tipografía dual, `[data-galaxy]`).
  Todo frontend o componente generado por cualquier IA/agencia para
  cualquier Galaxia debe importar ese archivo o replicarlo EXACTO — el skill
  explica el porqué; el archivo es el cómo. Consistencia obligatoria en las
  6 Galaxias.

**Principio de "Tecnología Invisible" (filosofía de UX adoptada)**:
la interfaz no debe sentirse como "una web de IA genérica" (brillo excesivo,
animación sin función). Prioridad: predictibilidad y respeto al tiempo del
usuario por sobre el impacto visual. Ante la duda entre una animación
vistosa y un control funcional que ahorra tiempo, se elige lo funcional.

**Métrica de navegación correcta**: NO usar la regla de "3 clics" (mito de
UX sin sustento empírico). Usar en su lugar: tiempo hasta completar la
acción, y que cada paso reduzca ambigüedad respecto del anterior.

**Legibilidad industrial**: datos técnicos (COE, pureza, MOQ, número de
lote) siempre en `--font-mono`, nunca en la tipografía display itálica.

---

## 3. Gobernanza de agentes de IA (CRÍTICO — leer antes de tocar código)

GWS opera con múltiples agentes de IA en paralelo (Claude para desarrollo,
Verdent como agente de producción/operaciones). Esta sección define los
límites duros. Ningún agente, humano delegado, ni sesión de IA puede
saltarse estas reglas invocando "eficiencia" o "el usuario lo pidió así".

### 3.1 Zona de Exclusión (ningún agente de IA entra, sin excepción)

- **Cero acceso a credenciales de tesorería**: ninguna IA conoce ni puede
  leer las API keys de Mercado Pago/Stripe/procesador de pago, ni
  credenciales bancarias.
- **Cero acceso de escritura a `Payment_Vault`**: el contenedor/servicio que
  habla con el procesador de pago y almacena tokens de transacción es
  inalterable para cualquier IA. Solo Jorge, con elevación de privilegio +
  2FA, puede modificar ese código o su configuración.
- **Cero cambios autónomos de tarifas o términos de suscripción**: ningún
  agente ejecuta un cambio de precio, comisión o término legal de forma
  automática, ni siquiera si fue "pre-aprobado" en abstracto. Todo cambio de
  este tipo requiere: agente prepara el cambio → notifica a Jorge → Jorge
  confirma explícitamente en el momento → se ejecuta.
- **Cero acceso a configuración raíz de servidor/infraestructura**: llaves
  SSH, estructura de directorios de producción, variables de entorno de
  secretos.

### 3.2 Zona de Acción (autonomía parcial, con límites explícitos)

- **Identificación de leads públicos**: permitido buscar/identificar
  perfiles públicos relevantes para las 6 Galaxias. **Prohibido el contacto
  automatizado en masa** (riesgo legal: ToS de redes/GitHub, Ley 25.326,
  posible exposición a GDPR si hay usuarios de la UE). Todo contacto pasa
  por revisión manual antes de enviarse.
- **Marketing y contenido**: un agente puede generar borradores de
  contenido (posts, flyers, respuestas de soporte). **Toda publicación a
  nombre de la marca GWS requiere aprobación humana antes de publicarse**,
  al menos durante la fase de lanzamiento. Un filtro automatizado puede
  descartar lo obviamente incorrecto como primera capa, pero no reemplaza
  la aprobación final humana.
- **Soporte técnico de primera línea**: un agente puede responder consultas
  frecuentes y mantener el manual de usuario actualizado, siempre con
  posibilidad de escalar a un humano.

### 3.3 Mecanismo de emergencia ("Código Rojo")

El kill switch **no es una instrucción que un agente "obedece"** — es una
acción de infraestructura: revocar/desactivar, desde el lado de Jorge, las
credenciales/tokens de API que se le dieron al agente (API keys, tokens
OAuth de redes conectadas). Un agente sin credenciales válidas no puede
seguir actuando, sin importar su estado interno. Cualquier diseño de
"Código Rojo" que dependa de que el agente decida detenerse por sí mismo
está mal diseñado y debe rechazarse.

### 3.4 Despliegue (aplica a cualquier cambio de código, humano o IA)

- Ningún cambio se aplica directo a producción. Flujo obligatorio:
  desarrollo → staging (entorno idéntico con datos de prueba) → validación
  → despliegue progresivo (canary) → producción completa.
- Feature flags por Galaxia: debe ser posible desactivar un módulo o un
  vendedor puntual de G2 sin apagar el resto de la plataforma.
- Antes de aplicar cualquier corrección, debe estar definido el mecanismo
  de rollback. Si no se puede responder "¿cómo se revierte esto?", no se
  aplica el cambio.

### 3.5 RBAC (control de acceso)

- Roles en capas, no binarios: `viewer` (solo lectura, para auditorías de
  terceros) → `moderator_gN` (control de una sola Galaxia) → `admin`
  (Jorge).
- Toda sesión empieza en el rol de menor privilegio disponible para esa
  cuenta. La elevación a `admin` requiere re-autenticación (contraseña +
  TOTP) y expira sola (ventana de 20-30 min).
- Cada acción tomada en modo elevado queda en un log inmutable (timestamp,
  IP, acción). Cada elevación de privilegio dispara una notificación por un
  canal distinto al que se está usando.

### 3.6 Soberanía de la plataforma — el chat interno es la única vía (CRÍTICO)

Todo contacto, negociación y cierre de acuerdos entre usuarios, artistas,
maestros y compradores ocurre **DENTRO** de la plataforma. Queda prohibido y
bloqueado por código cualquier intento de sacar la transacción o el contacto
fuera de GWS.

- **Bloqueo server-side, no advertencia**: el filtro anti-fuga
  (`src/community/anti-leak/contact-leak-filter.ts`) corre en el backend y
  RECHAZA el mensaje (HTTP 400) antes de guardarlo. Un filtro que solo
  "marca" en el navegador se evita con un POST manual — por eso la
  validación real vive en el servidor y el mensaje fugado nunca se guarda.
- **Qué se bloquea**: números de teléfono, correos directos, vínculos o
  menciones a WhatsApp/Instagram/Telegram/otras redes, URLs externas
  (incluidos acortadores), y geolocalización personal en crudo (coordenadas,
  vínculos a mapas). También se bloquea la intención explícita de salir de
  la plataforma ("por afuera", "te paso el dato por...") aunque no haya un
  dato parseable.
- **Trazabilidad**: cada bloqueo queda en `audit_logs` como
  `chat_contact_leak_blocked` (autor, canal, categorías detectadas, IP,
  contenido). Permite detectar reincidentes y revisar falsos positivos.
- **Política estricta a propósito**: ante la duda entre un falso positivo y
  dejar pasar una fuga, se bloquea y se audita. Ninguna "negociación por
  afuera" queda sin registro.
- **Arquitectura**: los futuros módulos de negociación (ofertas, acuerdos,
  mensajes privados comprador-vendedor) se construyen como entidades de la
  plataforma, bajo el mismo filtro anti-fuga. Prohibido integrar canales
  externos (WhatsApp API, email externo, redes) como vía de negociación.
- **Extensión prevista**: aplicar el mismo detector a otros puntos de
  ingreso de texto libre (descripciones de listings de G2, biografías de
  G1) en una fase posterior — hoy rige en el chat (única vía de contacto).

---

## 4. Stack técnico

- **Backend**: Node.js + NestJS + TypeScript, entidades vía TypeORM.
- **Base de datos**: PostgreSQL (relacional). Evaluar almacenamiento
  documental/vectorial solo para la Bóveda de Conocimiento (RAG), no para
  datos transaccionales.
- **Frontend**: Next.js + Tailwind CSS (producción). El prototipo actual en
  Claude.ai usa HTML/CSS/JS vanilla autocontenido — **no asumir que ese
  código se porta 1:1**; la estética y los tokens sí, la implementación de
  componentes se reescribe en el framework de producción.
- **Infraestructura**: AWS. Contenedores obligatorios (Docker/Kubernetes) —
  **CONFIRMADO** por Jorge como requisito innegociable del proveedor de
  hosting elegido.
- **Pagos**: procesador licenciado (Mercado Pago para Argentina; evaluar
  Stripe/dLocal para alcance internacional). Preferir checkout alojado por
  el procesador para minimizar alcance de cumplimiento PCI-DSS — el backend
  de GWS no debe manejar números de tarjeta en ningún caso.
- **Agente de producción (Verdent)**: implementado sobre Claude Agent SDK
  (no Claude Code — son productos distintos). Corre en contenedor separado
  (`Ops_Agent_Space`), sin credenciales de `Payment_Vault`, sin acceso de
  escritura a configuración raíz. **CONFIRMADO** por Jorge: Verdent no toca
  producción sin pasar primero por staging.

### PENDIENTE DE CONFIRMACIÓN (depende de infraestructura final con el proveedor)

- [ ] Proveedor de hosting definitivo y su plan específico de contenedores
  (nombre del proveedor, límites de recursos, región de datacenter).
- [ ] Gestor de secretos concreto a usar (AWS Secrets Manager asumido por
  coherencia con el resto del stack AWS — confirmar disponibilidad en el
  plan contratado).
- [ ] Procesador de pago definitivo y si se opera solo en Argentina o con
  alcance regional/internacional desde el lanzamiento.
- [ ] Herramienta de observabilidad (Sentry para errores, PostHog/Plausible
  para analytics, o equivalente) — no seleccionada aún.
- [ ] Alcance geográfico real de usuarios en el lanzamiento (condiciona si
  aplica GDPR además de Ley 25.326).

---

## 5. Convenciones de código

- Comentarios explicando el **por qué** de una decisión de diseño/negocio,
  no solo el qué (ej: por qué `ProductionBatch` es una entidad separada del
  stock tradicional, no solo un contador).
- Nombres de entidades y variables en inglés (convención de código);
  contenido de cara al usuario (UI, copy) en español, con `i18n` para
  inglés como segundo idioma confirmado. No agregar otros idiomas sin
  traducciones provistas y revisadas por Jorge.
- Ningún archivo de configuración con API keys o secretos en texto plano,
  bajo ninguna circunstancia. Usar variables de entorno + gestor de
  secretos, nunca commitear `.env` con valores reales.

## 6. Qué hacer si algo de este documento entra en conflicto con un pedido puntual

Si una instrucción en el chat contradice algo de la Sección 3 (Gobernanza),
la sesión de Claude Code debe señalar el conflicto explícitamente antes de
proceder, no asumir que el pedido puntual anula la regla general. Esta
sección tiene prioridad sobre instrucciones sueltas de una conversación,
salvo que Jorge la modifique explícitamente en este mismo archivo.
