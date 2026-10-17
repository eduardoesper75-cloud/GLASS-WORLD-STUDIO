# Glass World Studio — Project Guidelines

## Product context

Glass World Studio (GWS) is an international vertical marketplace and knowledge
ecosystem for the glass industry. It connects artists, workshops, schools,
suppliers, B2B commerce, industry, logistics, and technical professionals.
Its product model has six galaxies (Maestros, Commerce, Community, Silicate
Bonus, Industry, Materials) and five specialist satellites.

The application is the Next.js presentation layer in `apps/web`; taxonomy and
schemas in `packages/` are the source of truth, and the data pipeline is a
separate layer. Consult `README.md`, `docs/ARCHITECTURE.md`,
`docs/TAXONOMY.md`, and `apps/web/README.md` before changing product surfaces.
The official site is `https://www.glassworldstudio.com.ar/`.

The brand's trademark and intellectual-property registration with Argentina's
INPI is in progress. Do not describe it as registered or make legal claims
beyond the approved legal-page copy.

## Design workflow — all frontend work

For every task that creates or changes a frontend route, interface, component,
layout, or CSS:

1. Read and follow `.agents/skills/redesign-existing-projects/SKILL.md`.
2. For public-facing pages, read and follow
   `.agents/skills/design-taste-frontend/SKILL.md`. Use its direction, lint,
   browser-inspection, and look/fix workflow where applicable.
3. For app screens and dashboards, also read and follow
   `.agents/skills/high-end-visual-design/SKILL.md`; adapt the design system
   consistently rather than falling back to generic cards or default layouts.
4. Carry the established product-specific direction, typography, palette,
   spacing, motion, responsive behavior, and accessibility through every
   iteration and route. Respect reduced-motion preferences.
5. Verify the rendered result at desktop and mobile sizes as well as the
   relevant build/typecheck. Keep this guidance here so future frontend work
   automatically inherits it without copying the skill text into each task.

## Engineering

- Preserve the separation between the presentation layer, shared engine,
  pipeline, and data described in `docs/ARCHITECTURE.md`.
- Use existing package scripts, patterns, and localized messages. Do not
  introduce simulated data or claim that preview-only local actions create
  accounts, subscriptions, or marketplace listings.
- Validate frontend changes with `pnpm --filter @gws/web typecheck` and
  `pnpm --filter @gws/web build`.
