# CÓDIGO DE FUEGO — REGLAS CF

## Estado: PARCIAL · 72 reglas con texto + 193 RESERVADAS
## Fecha: 2026-10-05
## Sesión: GWS-4

---

## Bloque 1 — Henney (CF-01 a CF-07) · 7 reglas

### CF-01 — Excepciones de negocio ≠ excepciones técnicas

**Fuente:** Dan Bergh Johnsson, "Distingue excepciones de Negocio de las excepciones Técnicas"

**Texto:** Las excepciones de negocio representan reglas del dominio (fondos insuficientes, contraseña incorrecta) y deben manejarse explícitamente. Las excepciones técnicas representan fallos del sistema (DB caída, red) y deben elevarse a un manejador global. No mezclar en la misma jerarquía.

### CF-02 — Estados explícitos, transiciones protegidas

**Fuente:** Niclas Nilsson, "Pensando en estados"

**Texto:** Un objeto debe estar en uno de sus estados válidos en todo momento. Las transiciones entre estados deben ser explícitas y protegidas. No permitir estados intermedios inválidos. Modelar con máquinas de estado.

### CF-03 — Decimal para dinero, float para ciencia

**Fuente:** Chuck Allison, "Los números de punto flotante no son reales"

**Texto:** NUNCA usar float/double para dinero. Usar Decimal (decimal.js, BigDecimal, NUMERIC en Postgres). Los floats tienen errores de redondeo acumulativos. Los decimales son exactos.

### CF-04 — SRP: una sola razón para cambiar

**Fuente:** Robert C. Martin, "El Principio de Responsabilidad Única"

**Texto:** Una clase o módulo debe tener UNA sola razón para cambiar. Si cambia por reglas de negocio Y por formato Y por persistencia, son tres razones. Separar.

### CF-05 — DRY: una sola representación del conocimiento

**Fuente:** Steve Smith, "No te repitas"

**Texto:** Cada pieza de conocimiento debe tener UNA representación única, inequívoca y autorizada en el sistema. La duplicación infla el código y multiplica los bugs.

### CF-06 — Tests de comportamiento, no de implementación

**Fuente:** Kevlin Henney, "Prueba el comportamiento requerido, no el comportamiento incidental"

**Texto:** Los tests deben validar QUÉ hace el código, no CÓMO lo hace. No acoplarse a la implementación. Ejemplos concretos, no descripciones vagas.

### CF-07 — Interfaces fáciles de usar correctamente

**Fuente:** Scott Meyers, "Haz las Interfaces fáciles de usar correctamente y difíciles de usar incorrectamente"

**Texto:** Una buena API hace el uso correcto obvio y el uso incorrecto imposible. Guiar al usuario al éxito. Prevenir errores por diseño.

---

## Bloque 2 — RESERVADO (CF-08 a CF-56) · 49 reglas

### Estado: PENDIENTE EXTRACCIÓN DE LIBROS

### Fuentes: Hernández Yáñez, Jiménez Murillo, Moyano, Roiting/Busó, AMCHAMDR, MERCOSUR, Cuascota, Domínguez & Vera

---

## Bloque 3 — RESERVADO (CF-57 a CF-200) · 144 reglas

### Estado: HUECO DE NUMERACIÓN

### Acción: Definir si se rellenan o se renumera

---

## Bloque 4 — Refactoring.Guru (CF-201 a CF-223) · 23 reglas

**Fuente:** "El catálogo de patrones de diseño" (Refactoring.Guru)

> Nota: los 23 patrones GoF están divididos en 3 categorías. Cada uno se documenta como una regla.

#### CREACIONALES (5)

### CF-201 — Factory Method

**Texto:** Usar Factory Method cuando una clase no puede anticipar la clase de objetos que debe crear. Delegar la creación a subclases.

### CF-202 — Abstract Factory

**Texto:** Usar Abstract Factory para crear familias de objetos relacionados sin especificar sus clases concretas. Útil para múltiples temas (ej: componentes por galaxia).

### CF-203 — Builder

**Texto:** Usar Builder para construir objetos complejos paso a paso. Separar la construcción de la representación.

### CF-204 — Prototype

**Texto:** Usar Prototype para clonar objetos existentes sin acoplarse a sus clases. Útil para plantillas.

### CF-205 — Singleton (EVITAR)

**Texto:** EVITAR Singleton salvo casos muy justificados. Dificulta tests, crea acoplamiento global, rompe inyección de dependencias. Preferir contenedor de DI.

#### ESTRUCTURALES (7)

### CF-206 — Adapter

**Texto:** Usar Adapter para permitir que interfaces incompatibles trabajen juntas. Ej: distintas pasarelas de pago con una interfaz común.

### CF-207 — Bridge

**Texto:** Usar Bridge para separar una abstracción de su implementación para que ambas puedan variar independientemente.

### CF-208 — Composite

**Texto:** Usar Composite para componer objetos en estructuras de árbol y tratarlos como objetos individuales. Ej: categorías con subcategorías.

### CF-209 — Decorator

**Texto:** Usar Decorator para añadir responsabilidades a objetos dinámicamente sin modificar su clase.

### CF-210 — Facade

**Texto:** Usar Facade para proporcionar una interfaz simplificada a un subsistema complejo.

### CF-211 — Flyweight

**Texto:** Usar Flyweight para soportar grandes cantidades de objetos compartiendo estado común. Optimización de memoria.

### CF-212 — Proxy

**Texto:** Usar Proxy para proporcionar un sustituto o marcador de posición de otro objeto. Control de acceso.

#### COMPORTAMIENTO (11)

### CF-213 — Chain of Responsibility

**Texto:** Usar Chain of Responsibility para pasar solicitudes a lo largo de una cadena de manejadores. Ej: validaciones en cadena.

### CF-214 — Command

**Texto:** Usar Command para encapsular una solicitud como un objeto. Permite deshacer, encolar, registrar.

### CF-215 — Iterator

**Texto:** Usar Iterator para recorrer elementos de una colección sin exponer su representación interna.

### CF-216 — Mediator

**Texto:** Usar Mediator para reducir dependencias entre múltiples objetos centralizando la comunicación.

### CF-217 — Memento

**Texto:** Usar Memento para capturar y restaurar el estado interno de un objeto sin violar encapsulamiento.

### CF-218 — Observer

**Texto:** Usar Observer para notificar a múltiples objetos sobre cambios en otro objeto. Ej: notificaciones de pedidos.

### CF-219 — State

**Texto:** Usar State para permitir que un objeto cambie su comportamiento cuando su estado interno cambia. Estados explícitos.

### CF-220 — Strategy

**Texto:** Usar Strategy para definir una familia de algoritmos intercambiables. Ej: diferentes estrategias de envío, pago, comisión.

### CF-221 — Template Method

**Texto:** Usar Template Method para definir el esqueleto de un algoritmo, dejando pasos específicos a las subclases.

### CF-222 — Visitor

**Texto:** Usar Visitor para añadir operaciones a una estructura de objetos sin modificar sus clases. Ej: analytics, moderación.

### CF-223 — Regla general de patrones

**Texto:** Preferir composición sobre herencia. Aplicar el patrón solo cuando el problema lo justifique. No aplicar patrones por "usar patrones".

---

## Bloque 5 — Clean Code JS (CF-224 a CF-246) · 23 reglas

**Fuente:** "Clean Code JavaScript" (Ryan McDermott, traducción español)

### CF-224 — Máximo 2 argumentos por función

**Texto:** Ideal 0-2 argumentos. Si son 3+, consolidar en un objeto desestructurado. Más argumentos = más casos de test combinatorios.

### CF-225 — Prohibido flags booleanos como parámetros

**Texto:** Un flag booleano indica que la función hace más de una cosa. Dividir en dos funciones.

### CF-226 — Un solo nivel de abstracción por función

**Texto:** Una función debe operar en un solo nivel de abstracción. Mezclar niveles indica que hace demasiado.

### CF-227 — No escribir a variables globales

**Texto:** Las funciones no deben mutar variables globales. Retornar nuevos valores. Centralizar efectos secundarios.

### CF-228 — Preferir funciones puras

**Texto:** Funciones que toman un valor y retornan un valor, sin efectos secundarios. Fáciles de testear, fáciles de razonar.

### CF-229 — Encapsular condicionales complejas

**Texto:** Extraer condicionales complejos a funciones con nombre descriptivo. `if (shouldShowSpinner(fsm, node))` es mejor que `if (fsm.state === 'fetching' && isEmpty(node))`.

### CF-230 — Evitar condicionales negativos

**Texto:** `if (isPresent(node))` es mejor que `if (!isNotPresent(node))`.

### CF-231 — Evitar switch/if sobre tipos

**Texto:** Usar polimorfismo en lugar de switch/if sobre tipos de objetos.

### CF-232 — No type-checking manual

**Texto:** Usar TypeScript en lugar de validar tipos manualmente en runtime. El compilador lo hace mejor.

### CF-233 — No sobre-optimizar

**Texto:** No optimizar sin medir. Knuth: 97% del código no necesita optimización. Primero hazlo funcionar, después hazlo correcto, después hazlo rápido.

### CF-234 — Remover código muerto

**Texto:** Si no se llama, se borra. El historial de git lo guarda.

### CF-235 — Usar getters/setters

**Texto:** Encapsular acceso a propiedades. Permite validación, logging, lazy loading, cambios internos sin afectar consumidores.

### CF-236 — Miembros privados vía closures

**Texto:** Usar closures para encapsular estado privado en ES5. En ES6, usar campos privados con `#`.

### CF-237 — Clases ES6 sobre prototipos ES5

**Texto:** Usar `class` de ES6. Es más legible, mejor soportado, más claro en la intención.

### CF-238 — Method chaining

**Texto:** Retornar `this` al final de cada método para permitir encadenamiento. Estilo jQuery/Lodash.

### CF-239 — Composición sobre herencia

**Texto:** Preferir composición. Solo heredar si es relación "is-a", no "has-a".

### CF-240 — Un concepto por test

**Texto:** Cada test verifica UN comportamiento. Si tiene varios asserts de conceptos distintos, dividir.

### CF-241 — Promesas > callbacks. async/await > Promesas

**Texto:** Callbacks causan anidamiento. Promesas limpian. async/await limpian más.

### CF-242 — No ignorar errores capturados

**Texto:** `catch (e) { console.log(e) }` es insuficiente. Reportar, notificar, o loggear con contexto.

### CF-243 — No ignorar promesas rechazadas

**Texto:** Siempre manejar el `.catch()` o usar try/catch con await.

### CF-244 — Caller arriba, callee abajo

**Texto:** Las funciones se leen como un diario. La que llama arriba, la que es llamada abajo.

### CF-245 — No dejar código comentado

**Texto:** Version control existe. No dejar código comentado en el código fuente.

### CF-246 — No journal comments

**Texto:** No dejar comentarios con fecha ("2016-12-20: Removed X"). Usar git log.

---

## Bloque 6 — 24 Buenas Prácticas JS (CF-247 a CF-250) · 4 reglas

**Fuente:** "24 buenas prácticas de JavaScript para principiantes" (TutsPlus, traducción español)

### CF-247 — Usar "use strict"

**Texto:** Al inicio del programa o función. Fuerza errores explícitos en variables no declaradas.

### CF-248 — No confiar en hoisting

**Texto:** Declarar funciones y variables antes de usarlas. No depender de la elevación implícita.

### CF-249 — No mutar objetos pasados como parámetro

**Texto:** Retornar copia con spread. Evitar efectos colaterales en quien llamó.

### CF-250 — Usar getters/setters en objetos

**Texto:** Acceso controlado a propiedades. Ya cubierto en CF-235 pero aplicado a objetos literales.

---

## Bloque 7 — Twelve-Factor App (CF-251 a CF-262) · 12 reglas

**Fuente:** "The Twelve-Factor App" (Adam Wiggins)

### CF-251 — Un solo codebase, múltiples deploys

**Texto:** Un repositorio Git. Múltiples entornos (dev/staging/prod). Nunca múltiples repos para la misma app.

### CF-252 — Dependencias declaradas explícitamente

**Texto:** Toda dependencia en package.json. Instalar con `npm ci`. Nunca asumir instalación global.

### CF-253 — Config en variables de entorno

**Texto:** Configuración en env vars. NUNCA hardcodear secretos, URLs, credenciales. `.env.example` como plantilla.

### CF-254 — Backing services como recursos conectables

**Texto:** PostgreSQL, Redis, S3, Stripe = recursos conectables. Cambiar de proveedor sin tocar código.

### CF-255 — Separar build/release/run

**Texto:** Build (compila) → Release (combina con config) → Run (ejecuta). Nunca mezclar fases.

### CF-256 — Procesos stateless

**Texto:** Los procesos no guardan estado. Estado en la DB, no en memoria. Cada request es independiente.

### CF-257 — Port binding

**Texto:** La app se auto-conecta a un puerto. No depender de servidor web externo.

### CF-258 — Escalar vía procesos

**Texto:** Escalar horizontalmente (más procesos) no verticalmente (threads).

### CF-259 — Startup rápido + shutdown graceful

**Texto:** La app arranca en <10s. Ante SIGTERM, termina requests en curso antes de morir.

### CF-260 — Dev/prod parity

**Texto:** Dev, staging y prod usan el mismo stack. Mismo PostgreSQL, misma versión Node.

### CF-261 — Logs a stdout

**Texto:** Logs a stdout como flujo de eventos. No a archivos. La plataforma los captura.

### CF-262 — Admin processes como comandos one-off

**Texto:** Migraciones, seeds, consola → comandos separados. No mezclar con el runtime.

---

## Bloque 8 — Clean Code Neiva (CF-263 a CF-265) · 3 reglas

**Fuente:** "Clean Code en JavaScript" (Fundación Escuela Tecnológica de Neiva, Colombia)

### CF-263 — Nomenclatura consistente

**Texto:** camelCase para variables y funciones. PascalCase para clases. MAYÚSCULAS para constantes.

### CF-264 — Los 4 pilares del código limpio

**Texto:** Legibilidad, simplicidad, mantenibilidad, eficiencia. En ese orden de prioridad.

### CF-265 — Manejo de errores específico

**Texto:** Cada error tiene su código. Manejar específicamente (ENOENT, EIO, etc). No catch genérico.

---

## Estadísticas

- Total reglas: 265
- Con texto verificado: 72
- RESERVADAS: 193 (CF-08 a CF-200)

## Próximos pasos para completar

- Extraer CF-08 a CF-42 de los PDFs (Henney, Hernández Yáñez, Jiménez Murillo, Moyano, Roiting/Busó)
- Extraer CF-43 a CF-56 de los PDFs del lote 1
- Definir qué hacer con CF-57 a CF-200 (¿existen? ¿se renumera?)
