## Tarea relacionada

<!-- ID de la tarea, por ejemplo GWS-WEB-001. Si no existe issue, indicar el ID del backlog. -->

## Objetivo

<!-- Qué problema resuelve este PR y para quién. -->

## Base y alcance

- Rama base: `workspace/2026-10-24`
- Commit de partida:
- Rama de la tarea:
- Alcance incluido:
- Alcance excluido:

## Resumen de cambios

<!-- Cambios principales, sin repetir el diff completo. -->

## Frontera de dominio

- [ ] El cambio no incorpora estrategia comercial, alianzas, logística, prospección de inversores ni convocatorias dentro de `apps/web`.
- [ ] La documentación de negocio permanece en `docs/` y no se importa desde el frontend.
- [ ] No se agregaron rutas, componentes, textos ni claves de idioma fuera del producto.
- [ ] Las traducciones se mantienen en los siete idiomas existentes: `es`, `en`, `pt`, `it`, `fr`, `de`, `zh`.

## Coherencia visual

<!-- Aplicar solo si el PR modifica una interfaz, componente, layout o CSS. -->

- [ ] La vista conserva la atmósfera de Glass World Studio: tonos tierra oscuros, acentos ámbar/bronce y tipografía serif.
- [ ] No hay fondos planos sin textura, iluminación sutil o viñeta atmosférica.
- [ ] Se verificó el resultado en escritorio y en móvil.
- [ ] Se respetó `prefers-reduced-motion`.
- [ ] No se introdujeron patrones visuales genéricos ajenos al sistema.

## Pruebas ejecutadas

| Comando / comprobación | Resultado |
|---|---|
| `pnpm --filter @gws/web typecheck` | |
| `pnpm --filter @gws/web build` | |
| Revisión visual | |

## Pruebas no ejecutadas

<!-- Indicar cuáles y por qué. No declarar pruebas que no se ejecutaron. -->

## Seguridad y secretos

- [ ] No hay credenciales, tokens, contraseñas ni variables de entorno locales en el diff.
- [ ] No se incluyeron configuraciones MCP privadas, auditorías no trackeadas ni datos de terceros.
- [ ] `productionBrowserSourceMaps` permanece en `false`.
- [ ] No se publicaron mapas de fuente ni artefactos de ingeniería inversa.

## Riesgos

<!-- Riesgos técnicos, de producto o de seguridad. -->

## Reversión

<!-- Cómo revertir el cambio sin reescribir historial. -->

## Checklist de cierre

- [ ] El alcance coincide con la tarea aprobada.
- [ ] Las pruebas ejecutadas están registradas.
- [ ] Las pruebas no ejecutadas están declaradas.
- [ ] El diff no contiene archivos fuera de alcance.
- [ ] No se modificó `main`.
- [ ] No se activó auto-merge.
- [ ] El despliegue no se considera implícito.
