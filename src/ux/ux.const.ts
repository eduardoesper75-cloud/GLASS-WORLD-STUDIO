/**
 * GWS · Manifiesto de experiencia (UX) — Orden Suprema
 * ------------------------------------------------------------
 * Base de datos de la auditoría continua de micro-fricciones. Los
 * agentes consultan `GET /ux/manifest` y auditan contra ESTE manifiesto,
 * no contra impresiones subjetivas.
 *
 * RECONCILIACIÓN DE DOGMA (ver docs/ux/estandar-3-clics.md): el mandato
 * "toda operación crítica en ≤3 clics" entra en conflicto con CLAUDE.md
 * §2 (la regla de los "3 clics" es un mito de UX sin sustento empírico).
 * Se resuelve así: el clickBudget=3 es una DIRECTRIZ de navegación
 * superficial (matar menús anidados, jerarquía evidente), y el KPI de
 * verificación es el de §2: tiempo hasta completar la acción + cada paso
 * reduce ambigüedad respecto del anterior. El manifiesto audita ambas
 * cosas: `steps` con `reducesAmbiguity` explícito y `clickBudget` como
 * techo de diseño.
 */

export interface UxStep {
  /** Etiqueta corta del paso (verbo + objeto). */
  label: string;
  /** Cómo este paso reduce la ambigüedad respecto del anterior. */
  reducesAmbiguity: string;
  /** Anclaje en la UI (id de sección en la portada / ruta de destino). */
  anchor: string;
}

export interface UxFlow {
  id: string;
  title: string;
  galaxy: string;
  /** Techo de diseño (navegación superficial). NO es métrica dura. */
  clickBudget: number;
  steps: UxStep[];
}

export interface UxManifest {
  version: string;
  updatedAt: string;
  kpiPolicy: string;
  principles: { id: string; rule: string }[];
  flows: UxFlow[];
  microFrictions: { id: string; rule: string }[];
  multimedia: {
    standard: string;
    embedKinds: string[];
  };
}

export const UX_MANIFEST_VERSION = '1.0.0';
export const UX_MANIFEST_UPDATED_AT = '2026-08-02';

export const UX_MANIFEST: UxManifest = {
  version: UX_MANIFEST_VERSION,
  updatedAt: UX_MANIFEST_UPDATED_AT,
  kpiPolicy:
    'KPI de verificación = tiempo hasta completar la acción + cada paso reduce ' +
    'ambigüedad respecto del anterior (CLAUDE.md §2). El clickBudget es techo ' +
    'de diseño de navegación superficial, no una métrica dura.',
  principles: [
    {
      id: 'shallow_nav',
      rule: 'Prohibidos los menús anidados infinitos. Toda operación crítica se ' +
        'resuelve con navegación superficial (máx. 3 niveles de anidamiento).',
    },
    {
      id: 'directive_hierarchy',
      rule: 'La jerarquía visual debe guiar la mano: una sola acción primaria por ' +
        'pantalla, contraste alto, flujo evidente de arriba a abajo.',
    },
    {
      id: 'functional_over_flash',
      rule: 'Ante la duda entre animación vistosa y control que ahorra tiempo, ' +
        'se elige lo funcional (Tecnología Invisible, CLAUDE.md §2).',
    },
    {
      id: 'mono_technical_data',
      rule: 'Datos técnicos (COE, pureza, MOQ, lote, presión de corte) SIEMPRE ' +
        'en --font-mono, nunca en la display itálica.',
    },
    {
      id: 'media_vitrine',
      rule: 'Los activos de alto valor se presentan con video inmersivo (embed ' +
        'YouTube/Vimeo/CDN propio) — nunca con foto estática únicamente.',
    },
    {
      id: 'sovereign_embeds',
      rule: 'Los embeds pasan por el allowlist soberano de exhibición; jamás ' +
        'canales de contacto o acortadores (§3.6). El maestro enlaza su canal ' +
        'sin poder fugarse contacto.',
    },
  ],
  flows: [
    {
      id: 'buy',
      title: 'Comprar (obra/insumo en el Marketplace)',
      galaxy: 'G2 · Marketplace General',
      clickBudget: 3,
      steps: [
        {
          label: 'Elegir producto',
          reducesAmbiguity: 'El catálogo muestra precio + COE + video demo de una, ' +
            'eliminando el "es lo que parecía"',
          anchor: '#marketplace',
        },
        {
          label: 'Pagar en checkout',
          reducesAmbiguity: 'El checkout muestra desglose transparente (valor + ' +
            'comisión + aduana estimada) antes de ningún dato de pago',
          anchor: '#checkout',
        },
        {
          label: 'Confirmar',
          reducesAmbiguity: 'La confirmación muestra el total final y el método; ' +
            'cerrar requiere un solo gesto',
          anchor: '#checkout',
        },
      ],
    },
    {
      id: 'subscribe',
      title: 'Suscribirse (membresía)',
      galaxy: 'Transversal · Tarifario',
      clickBudget: 3,
      steps: [
        {
          label: 'Elegir plan',
          reducesAmbiguity: 'El tarifario muestra precio + fidelización por mes ' +
            '(3m=10%, 6m=15%, 12m=20%)',
          anchor: '#tarifario',
        },
        {
          label: 'Datos de pago',
          reducesAmbiguity: 'Hosted checkout del procesador: GWS jamás toca ' +
            'números de tarjeta (PCI-DSS por diseño)',
          anchor: '#suscribirse',
        },
        {
          label: 'Confirmar suscripción',
          reducesAmbiguity: 'El estado de la cuenta cambia de inmediato y el ' +
            'acceso a la Galaxia elegida se habilita',
          anchor: '#suscribirse',
        },
      ],
    },
    {
      id: 'publish_work',
      title: 'Publicar una obra',
      galaxy: 'G2 · Marketplace General',
      clickBudget: 3,
      steps: [
        {
          label: 'Crear listing',
          reducesAmbiguity: 'Un formulario con las specs técnicas mínimas de la ' +
            'categoría (COE si es vidrio), validado antes de guardar',
          anchor: '#publicar',
        },
        {
          label: 'Adjuntar media',
          reducesAmbiguity: 'Fotos + video demo (embed YouTube/Vimeo) sin subir ' +
            'archivos al servidor',
          anchor: '#publicar',
        },
        {
          label: 'Publicar',
          reducesAmbiguity: 'Soft-publicación: el item sale activo y el radar de ' +
            'proximidad lo ubica en el mapa regional',
          anchor: '#publicar',
        },
      ],
    },
    {
      id: 'view_course',
      title: 'Ver una masterclass magistral',
      galaxy: 'G1 · Íconos y Maestros',
      clickBudget: 3,
      steps: [
        {
          label: 'Elegir masterclass',
          reducesAmbiguity: 'El catálogo del maestro lista cursos con nivel y ' +
            'duración (nunca "dura 2 horas" ambiguo)',
          anchor: '#galaxia-1',
        },
        {
          label: 'Acceder',
          reducesAmbiguity: 'Compra o suscripción otorga acceso de inmediato',
          anchor: '#galaxia-1',
        },
        {
          label: 'Reproducir',
          reducesAmbiguity: 'El visor inmersivo reproduce el embed con poster y ' +
            'botón único',
          anchor: '#visor',
        },
      ],
    },
    {
      id: 'audit_machine',
      title: 'Auditar una máquina pesada',
      galaxy: 'G5 · Gran Industria',
      clickBudget: 3,
      steps: [
        {
          label: 'Seleccionar máquina',
          reducesAmbiguity: 'Catálogo de maquinaria pesada con specs técnicas ' +
            '(voltaje, presión) en mono',
          anchor: '#galaxia-5',
        },
        {
          label: 'Ver demo técnica',
          reducesAmbiguity: 'Video inmersivo de la mesa operando (corte por agua ' +
            'en vivo) — se entiende la máquina sin leer',
          anchor: '#visor',
        },
        {
          label: 'Solicitar auditoría',
          reducesAmbiguity: 'La solicitud de auditoría/inspección se inicia con ' +
            'un solo gesto, dentro de la plataforma (§3.6)',
          anchor: '#auditoria',
        },
      ],
    },
  ],
  microFrictions: [
    { id: 'no_nested_menus', rule: 'Toda fricción de navegación >3 niveles se reporta como defecto' },
    { id: 'step_ambiguity', rule: 'Todo paso que NO reduzca ambigüedad respecto del anterior se reporta' },
    { id: 'flash_without_function', rule: 'Toda animación sin función (no ahorra tiempo) se reporta' },
    { id: 'tech_data_in_display', rule: 'Todo dato técnico en tipografía display (no mono) se reporta' },
    { id: 'contact_leak_vitrine', rule: 'Toda vitrina que exponga canal de contacto externo se reporta' },
    { id: 'missing_media', rule: 'Todo activo de alto valor sin video demo se reporta como oportunidad' },
  ],
  multimedia: {
    standard:
      'Vitrinas de alto valor con visor de video de alta inmersión: embed YouTube/' +
      'Vimeo/CDN propio (sin carga en el servidor), poster + botón único, y ' +
      'sincronización de canal del autor. Allowlist soberano: nunca canales de contacto.',
    embedKinds: ['youtube', 'youtube_channel', 'vimeo', 'stream', 'iframe'],
  },
};
