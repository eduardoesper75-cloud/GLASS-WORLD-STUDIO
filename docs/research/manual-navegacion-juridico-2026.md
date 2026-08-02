# Manual Navegación, Blindaje Jurídico y Exención de Responsabilidad — Investigación 2026

> **Órdenes 3, 5, 6 y 7 · Research · 2026-08-02**
> Objeto: fundamentar el Blindaje Jurídico Global del manual ("El Código del
> Fuego" v2.0) y el patrón de navegación del manual maestro, con
> benchmarks del sector y normativas de exoneración de plataformas de
> intermediación digital.

---

## 1 · Contexto y alcance

Glass World Studio es un **puente tecnológico y digital** (vinculación,
pasarela de pago, escrow automatizado). No fabrica, no transporta, no
importa ni exporta mercancía. El blindaje del manual declara:

- Limitación absoluta de responsabilidad civil/penal/comercial/logística
  por el uso indebido o fraudulento de terceros.
- Tolerancia cero al fraude con registro auditable.
- Exención expresa por siniestros en tránsito (embalaje excluyente del
  vendedor).

Esta investigación valida el marco legal comparado y los patrones de
presentación de manuales de alta tecnología.

---

## 2 · Normativas internacionales relevantes (safe harbor / intermediación)

### 2.1 · Estados Unidos — CDA Section 230 (47 U.S.C. § 230)

- Los proveedores de un servicio informático interactivo **no son tratados
  como editores ni oradores** del contenido generado por terceros.
- No se les impone responsabilidad civil por publicar/retirar contenido de
  terceros ("good Samaritan").
- Alcance: plataformas con contenido de usuarios; no exime de derecho
  penal, propiedad intelectual ni incumplimiento de contratos privados.
- Referencia: Communications Decency Act § 230(c)(1)-(2).

### 2.2 · Estados Unidos — DMCA (17 U.S.C. § 512, Online Copyright
Infringement Liability Limitation Act)

- **Safe harbor por "transmitir" (mere conduit), "cachear" (caching),
  "alojar" (storage) y "enlazar" (linking)** contenido de usuarios.
- Condición: no tener conocimiento efectivo de la infracción, retirar el
  material al notificarlo (notice-and-takedown), designar agente y no
  obtener beneficio directo atribuible a la actividad infractora.
- Relevancia: GWS enlaza proveedores y aloja fichas de usuarios; el
  cumplimiento de notice-and-takedown refuerza la exención.

### 2.3 · Unión Europea — DSA (Reglamento 2022/2065, Digital Services Act)

- Régimen escalonado de responsabilidad para **intermediarios**:
  - **Mera transmisión (mere conduit)**: no responsabilidad si no origina,
    modifica ni selecciona el contenido ni su destinatario.
  - **Almacenamiento en caché**: no responsabilidad si no modifica ni
    infringe normas de acceso, y actúa con prontitud al tener conocimiento.
  - **Alojamiento (hosting)**: exención condicionada a no tener
    conocimiento efectivo de actividad ilegal y actuar diligentemente al
    conocerla (notice-and-action).
- Obligación transversal: transparencia, medios de contacto, reportes de
  transparencia y **notice-and-action** para contenidos ilícitos.
- Referencia: Reglamento (UE) 2022/2065, arts. 4, 5, 6, 16 y 24.

### 2.4 · Directiva de comercio electrónico UE (2000/31/CE, derogada por el
DSA pero histórica)

- Consolidó el principio: el intermediario que "se limita a transportar,
  almacenar o alojar" no responde por el contenido mientras sea neutral y
  diligente (arts. 12-14). Base doctrinal del "intermediary immunity".

### 2.5 · Argentina — régimen aplicable

- **Ley 25.326** (Hábeas Data) regula el tratamiento de datos personales;
  relevante para los datos del Búnker (ingenieros matriculados) y de los
  usuarios: consentimiento, finalidad, seguridad.
- **CCyCN (Ley 26.994)**: arts. 1109 ss. sobre responsabilidad civil;
  exoneración del intermediario si la plataforma no asumió deber de
  garante y actuó con diligencia en el retiro de contenido lesivo.
- **Ley 24.240** (defensa del consumidor): aplica a proveedores de bienes y
  servicios; GWS actúa como intermediario tecnológico — la delimitación de
  roles (plataforma vs. vendedor) es clave para no ser tratado como parte
  vendedora.
- Jurisprudencia de responsabilidad de intermediarios en redes: se requiere
  culpa o conocimiento efectivo; la mera intermediación no genera
  responsabilidad objetiva.

### 2.6 · Escrow y neutralidad de la custodia

- El escrow neutral (retención/liberación por hitos) consolida la posición
  de GWS como **custodio técnico** y no como garante del negocio subyacente.
- La **Payment_Vault** ejecuta la transferencia real (fuera del backend de
  negocio); el contrato de escrow delimita: función de custodia, matriz de
  liberación (24 h–10 días), resolución de reclamos por el comando y
  registro auditable.

---

## 3 · Benchmark de manuales de alta tecnología (patrón de navegación)

| Referencia | Patrón que adopta el manual maestro |
|---|---|
| **Stripe Docs** | Índice lateral sticky con enlaces de salto, secciones independientes, estados claros, lenguaje directo. |
| **Apple Support / Notion Help** | Tema "un clic te lleva": anchor links, cajas de aviso, versionado visible. |
| **Linear / Railway docs** | Lectura quirúrgica: cada sección funciona sola, tablas de parámetros, valores en mono. |
| **Términos de marketplace** (p. ej. grandes plataformas) | "Mere facilitator / no responsible for third-party conduct" + tolerancia cero a fraude + cooperación con autoridades. |

Traducción a GWS (aplicado en el manual v2.0):

1. **Índice lateral sticky** con enlaces de salto (`design-system/manual-codigo-del-fuego.html`).
2. **Secciones estancas**: cada Galaxia/módulo es independiente (G1, G2/3/4, G5, G6, Bóveda, Búnker, Carteleras, Settlement, Escrow, Soporte).
3. **Tablas de parámetros** y valores técnicos en tipografía mono.
4. **Blindaje jurídico en cabecera** (sección 0) y **exención expresa** en Escrow (sección 9).
5. **Fuente de verdad única**: `docs/manual/codigo-del-fuego.md` (texto) + render interactivo en HTML (presentación).

---

## 4 · Conclusiones y riesgos

- La posición de "puente tecnológico neutral" de GWS coincide con los
  supuestos clásicos de exención de intermediarios (mera intermediación +
  diligencia). **La diligencia exige**: notice-and-takedown operativo,
  mecanismo de contacto, registro auditable y retiro oportuno de contenido
  ilícito.
- La **tolerancia cero al fraude** y la colaboración con autoridades son
  condiciones de mantenimiento de cualquier safe harbor.
- **Riesgo principal**: que la plataforma sea tratada como "parte vendedora"
  (por cobrar comisión, custodiar fondos u organizar el transporte). Mitigación
  contractual: declarar expresamente rol de intermediario, cobrar tarifa por
  servicio tecnológico, y que el escrow sea custodia neutral con matriz
  objetiva.
- **Pendiente jurídico formal**: revisión del texto definitivo de Términos y
  Condiciones por un abogado (registrado en el checklist legal de la plataforma).

---

## 5 · Fuentes consultadas

- 47 U.S.C. § 230 (Communications Decency Act).
- 17 U.S.C. § 512 (DMCA — OCILA).
- Reglamento (UE) 2022/2065 (Digital Services Act), arts. 4-6, 16, 24.
- Directiva 2000/31/CE (comercio electrónico), arts. 12-14.
- Ley Argentina 25.326 (Hábeas Data) y 24.240 (defensa del consumidor).
- CCyCN Ley 26.994, régimen de responsabilidad.
- Benchmarks: Stripe Docs, Apple Support, Notion Help Center, Linear,
  Railway Docs (patrones de navegación y avisos legales).
