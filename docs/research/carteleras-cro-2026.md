# Carteleras Publicitarias — Inteligencia CRO y medición (2026)

> **Orden Suprema de integración**: sistema de carteleras publicitarias
> dinámicas por Galaxia — USD 1/día, una campaña a la vez, cola de espera por
> cartelera.
> **Fecha**: 2026-08-02. **Estado**: motor implementado (`src/billboards/`).
> Este documento orienta el diseño de las piezas y la medición de conversión.
> Regla dura: `targetUrl` es SIEMPRE ruta interna de GWS (§3.6) — no hay
> landing externa que medir.

---

## 1. Qué sabe la industria (efectividad de vallas digitales)

- **Recall**: el 82 % de los espectadores recuerda un anuncio digital en valla
  un mes después (Reportlinker, cit. Nartak).
- **ROI/CPM**: retorno promedio ~**US$ 6 por dólar** invertido; CPM entre
  **US$ 2 y 7** (mediafinch 2025).
- **Integración multiplataforma**: OOH +212 % de alcance sobre campañas de
  redes sociales; +18 % de alcance sobre compras de TV; campañas cross
  OOH+móvil 2× más efectivas; 40 % de quienes ven un OOH busca la marca en
  Google inmediatamente (WifiTalents 2026).
- **Retargeting**: retargetear a móviles que pasaron por la valla sube el CTR
  un **48 %**.
- **Respuesta**: 45 % de adultos del Reino Unido responde a OOH de alguna
  forma; marcas con OOH tienen ~26 % más de utilidades (Bauer Media Outdoor).

## 2. Reglas de diseño de la pieza (aplicables a la portada de la cartelera)

- **Ventana de lectura**: ~6 segundos (tráfico urbano). Un mensaje, una
  acción; tipografía grande y legible.
- **Contraste**: amarillo sobre negro 94 % legibilidad; blanco sobre azul
  oscuro 89 %; negro sobre amarillo 87 %.
- **CTA memorable** que cruce el puente offline→online (QR / ruta corta).
- **Contenido dinámico**: conteos regresivos, clima/hora, "hoy" — suben
  atención sin subir presupuesto.
- Fuentes: Times Square Billboard, Adobe, Plug Talk Media, Nartak (2025-2026).

## 3. La pieza GWS es diferente (y esto es una ventaja)

En GWS la cartelera NO es un poster: es un **slot vivo dentro de la
plataforma**, con estado en tiempo real (al aire / libre / encolada). El
"espectador" ya está dentro del ecosistema, por lo que la métrica de interés
no es recall sino **clic a ruta interna → conversión dentro de GWS**.

| Métrica | Definición GWS | Fuente de datos |
|---|---|---|
| Impresiones | Vistas de la sección carteleras / feed `/billboards/active` | frontend/analytics |
| Clics | Clics en `targetUrl` (ruta interna) | click logging (a cablear) |
| CTR de cartelera | clics ÷ impresiones del feed | igual que arriba |
| Conversión de la ruta | cupo de fundación, suscripción, mensaje, ticket Búnker | backends respectivos |
| Cola/ocupación | tiempo medio de espera por cartelera (health del negocio) | `/billboards/availability` |

**Bucle CRO** (consistente con CLAUDE.md §2 — medir tiempo-a-acción y reducción
de ambigüedad, no la métrica mítica de "3 clics"):

1. El anunciante define UN objetivo (ej. cupo, masterclass, catálogo).
2. La pieza declara la acción en el título (ej. "Seminario · cupo fundador").
3. El clic cae directo en la ruta interna correspondiente, sin pasos
   intermedios; cada paso posterior solo reduce ambigüedad.

## 4. Economía del slot

- Tarifa plana **USD 1/día** (sin subastas): la decisión de precio queda
  separada del mecanismo — baja fricción y elimina sobreofertas.
- Una campaña a la vez por cartelera; el **encolado** (queued) convierte
  demanda excedente en expectativa programada: al anunciante se le informa la
  fecha exacta de salida al aire (`nextAvailableStart`) en la respuesta de la
  reserva — esto es "reducir ambigüedad del siguiente paso".
- `billingStatus` (due/paid) es base de liquidación futura; el cobro real es
  del **Payment_Vault (§3.1)**. Este módulo jamás mueve dinero.

## 5. Reglas soberanas de la pieza (no negociables)

- **`targetUrl` = ruta interna GWS** validada con `^\/[^:\s]*$` — jamás URL
  externa, acortador o canal de contacto (§3.6).
- Nada de "contactanos por WhatsApp": el CTA es siempre una acción dentro de
  la plataforma (cupo, catálogo, mensaje, ticket).
- Pausa de cartelera = solo admin + elevación `manage_billboards` con audit
  (`requiredElevation: true`).

## 6. Pendientes

- [ ] Cablear click-tracking por campaña (tabla `ad_campaign_events`) y el
      embudo impresiones→clics→conversión para el dashboard de anunciantes.
- [ ] Definir con Jorge si el anunciante elige "empezar hoy" sin fecha (hueco
      más próximo) como opción por defecto del formulario.
- [ ] Validación E2E de la migración `BillboardsSchema` cuando Docker esté
      operativo.
