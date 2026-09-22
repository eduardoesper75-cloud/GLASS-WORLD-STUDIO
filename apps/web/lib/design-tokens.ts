/**
 * GWS · Design Tokens (TypeScript) — espejo del canónico
 * =======================================================
 * Fuente única de verdad en CSS: `design-system/gws-design-tokens.css`.
 * Este módulo replica EXACTAMENTE esos valores para que Tailwind y los
 * componentes de React consuman la misma identidad (adaptación, no
 * duplicación divergente — regla "Tokens primero", README del design
 * system).
 *
 * DECISIÓN DE ADAPTACIÓN (Orden Maestra FASE 2.2 vs canónico):
 * La orden pedía obtener suerte (#030712, #FFD700, Cinzel, hues inventados
 * por galaxia). El canónico gws-design-tokens.css es la fuente autoritativa
 * y prohíbe inventar tonos ("Tokens primero", "no inventar tokens por
 * componente"). ADAPTÉ la estructura pedida a los valores canónicos:
 *   - bg.base #030712            -> #07080a (--bg-void)
 *   - bg.elevated                -> #0d0f13 (--bg-raised)
 *   - text.primary               -> #f3f1ec (blanco cálido, nunca #fff)
 *   - accent.amber #FFD700       -> #e8a54b (--g1-core, oro de horno)
 *   - accent.ember               -> #d98a3d (--g5-amber)
 *   - fonts Cinzel/JetBrains Mono-> 'Instrument Serif' / 'IBM Plex Mono'
 *     (tipografía dual canónica, --font-display/--font-mono)
 *   - hues por galaxia en galaxies.ts usan los cores canónicos G1..G6.
 */

export const colors = {
  bg: {
    base: '#07080a',
    elevated: '#0d0f13',
  },
  text: {
    primary: '#f3f1ec',
    secondary: '#c9c6bd',
    muted: '#9aa0a8',
  },
  accent: {
    amber: '#e8a54b',
    ember: '#d98a3d',
    glow: 'rgba(232, 165, 75, 0.15)',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.20)',
    accent: 'rgba(232, 165, 75, 0.30)',
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.045)',
    border: 'rgba(255, 255, 255, 0.12)',
    'strong-bg': 'rgba(255, 255, 255, 0.08)',
    'strong-border': 'rgba(255, 255, 255, 0.28)',
  },
  // Paleta por Galaxia (canónico) — sólo colores autorizados
  g1: { core: '#e8a54b', glow: '#f4c77e' },
  g2: { core: '#4fa8d8', glow: '#7fc4ea' },
  g3: { core: '#e36e80', glow: '#f09aa8' },
  g4: { core: '#8577e0', glow: '#aba1ee' },
  g5: { core: '#9ba5b3', glow: '#c7ceda', amber: '#d98a3d' },
  g6: { core: '#52e0c4', glow: '#8cf0dc' },
  satellite: { core: '#f2545b', glow: '#ff8288' },
};

export const fonts = {
  display: ['Instrument Serif', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const glass = {
  backdrop: 'blur(12px) saturate(180%)',
  backdropStrong: 'blur(24px) saturate(200%)',
  // Canónico (usado por .glass en CSS)
  canonicalBackdrop: 'blur(18px) saturate(140%)',
};

export const blur = {
  glass: '12px',
  'glass-strong': '24px',
  canonical: '18px',
};

export const motion = {
  duration: {
    micro: '150ms',
    state: '250ms',
    fade: '400ms',
    cinema: '420ms',
    slow: '800ms',
    hero: '1100ms',
  },
  easing: {
    cinema: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
};

export const containerWidth = '1280px';