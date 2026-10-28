# GWS · Sincronización del monoplaza UI

**Tarea:** `GWS-BASELINE-AND-MONOPLAZA-SYNC-001`
**Fecha:** 2026-10-28
**Rama:** `feat/GWS-WEB-001-monoplaza-frontend`
**Baseline de código:** `1bdafd2df3057d633c47a998da982ef5aca7830f`

## 1. Estado de la sincronización

El código de la interfaz web ya estaba versionado en
`workspace/2026-10-24` y publicado en `origin/workspace/2026-10-24`.
La comparación directa no muestra diferencias de fuente:

```text
git diff origin/workspace/2026-10-24..HEAD -- apps/web
sin diferencias
```

La rama de tarea se creó desde ese baseline y se publicó en el remoto. No se
inventaron cambios de producto ni se reescribió historial.

## 2. Superficies incluidas en el baseline

- Portada y bienvenida: `apps/web/src/app/page.tsx`,
  `WelcomeCover`, `ConvocatoriaFlyer`.
- Umbral de acceso: `apps/web/src/app/umbral/page.tsx`.
- Hub de galaxias: `apps/web/src/app/inicio/page.tsx`,
  `DashboardHome`, `GalaxyOneDashboard`,
  `OtherMembershipDashboards`.
- Dashboards de creador y profesionales:
  `MasterCreatorDashboard`, `professionals/dashboard`.
- Navegación, idioma y privacidad: `LanguageProvider`,
  `LanguageSelector`, `PrivacyConsent`, `SiteFooter`.
- Siete locales: `es`, `en`, `pt`, `it`, `fr`, `de`, `zh`.

## 3. Validación ejecutable

Ejecutada en el worktree local de la rama:

```text
pnpm install --frozen-lockfile      PASS
pnpm build:engine                   PASS
pnpm --filter @gws/web typecheck    PASS
pnpm --filter @gws/web build        PASS
```

El build generó 11 rutas. No se ejecutaron pruebas de producto porque el
workspace web no tiene suite de pruebas.

## 4. Previsualización

- La aplicación de producción se levantó localmente en
  `http://localhost:3000`.
- GitHub Pages no estaba habilitado al iniciar la tarea.
- Se incorporó `.github/workflows/pages-preview.yml` para publicar una galería
  estática de auditoría desde `preview/`.
- La galería contiene capturas reales de `/`, `/umbral` e `/inicio`.
- GitHub Pages no ejecuta el runtime de Next.js; la galería es una vista visual,
  no una app interactiva.

## 5. Límites

- No se modificó `main`.
- No se fusionó el PR #1.
- No se modificaron archivos de configuración privada ni auditorías no
  trackeadas.
- No se implementó `GWS-WEB-001`.
- No se crearon cuentas, suscripciones, pagos ni datos de marketplace.
