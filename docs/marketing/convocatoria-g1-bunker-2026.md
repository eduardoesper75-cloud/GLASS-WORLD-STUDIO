# Convocatoria de Autoridad — Maestros G1 e Ingenieros del Búnker (2026)

> **Objetivo**: traer a los nombres propios que dan prueba social antes de la
> apertura: maestros consagrados (G1) e ingenieros de planta (Búnker).
> Regla dura: **cero contacto automatizado en masa** (§3.2) — todo acercamiento
> es curado, humano y sin canales de contacto externos (§3.6).

---

## 1. Convocatoria a maestros consagrados (G1)

### Modelo económico que se ofrece

| Concepto | Valor |
|---|---|
| Comisión por venta de líneas propias | **Justa y plana** (ver `commission_rules` vigente) |
| Galería personal | Incluida (G1) |
| Publicación de técnicas | Bóveda con curaduría + crédito del autor |
| Cuota de entrada | No aplica a G1 fundador |

### Argumento de convocatoria

> "Tu oficio sobrevivió a generaciones de silencio. Guardalo en la Bóveda,
> vendé tus líneas en tu galería, y que tu nombre pague lo que vale. Sin
> comisiones escondidas, sin intermediarios que se lleven tu obra."

### Protocolo de acercamiento

1. Selección por reputación verificable (obra pública, trayectoria, premios).
2. Primer contacto **humano, individual y respetuoso** por el canal que el
   propio maestro use públicamente.
3. Se ofrece demo de la galería + línea propia sin obligación.
4. Nada se promete que el producto aún no haga (la Bóveda y la Galería deben
   estar mínimamente operativas antes de la firma de un G1).

## 2. Convocatoria a ingenieros de planta (Búnker)

### Modelo económico que se ofrece

| Concepto | Valor |
|---|---|
| Membresía | **USD 50/mes** |
| Comisión | **0 %** — la plataforma no retiene un peso de lo que cobre el ingeniero |
| Soporte | Remoto global / regional presencial / emergencia de planta |
| Radicación | Directorio público sin datos de contacto (privacidad: contacto solo tras solicitud formal del proyecto) |

### Argumento de convocatoria

> "La planta no puede esperar al último PDF que nadie actualizó. El Búnker es
> la red de demanda de ingenieros del vidrio: te eligen por especialidad, no por
> contactos. Cero comisión. USD 50/mes. Tu perfil, tu tarifa, tu regla."

### Verificación élite

- Cada ingeniero que se matricula entra **pendiente de verificación élite**
  (estado `pending`), como exige la directiva de soberanía.
- El sello élite (estado `verified`) lo emite el comando tras validación
  humana de matrícula e institución — mismo gate de confianza que rige a los
  maestros G1.

## 3. Orden de convocatoria (prioridad)

1. **Primero el producto mínimo real**: Bóveda + Galería + Búnker operativos
   (sin ello, no hay nombres propios que convocar).
2. **Luego los ingenieros Búnker** (matrícula ya funcional — este documento
   es el tercer hito del escuadrón de despliegue).
3. **Después los maestros G1**, con demo real en mano.
4. **Finalmente la campaña pública** (ver `campana-fundadores-2026.md`).

## 4. Escaleras de verificación (estados actuales)

- Búnker: `pending` → `verified` (vía `PUT /bunker/specialists/:id/verify` con
  elevación ADMIN) · el alta desde la portada crea siempre `pending`.
- G1: gate equivalente a definir con Jorge cuando el backend de maestros
  exista.

## 5. Pendientes

- [ ] Confirmación de Jorge del SLA del Búnker (standard 48h/5d · urgent
      24h/72h · critical 4h remoto / 24h presencial) — **bloqueado**.
- [ ] Definir el modelo G1 final en `commission_rules` (no tocar el vigente
      hasta orden explícita).
- [ ] Endpoint/UX de demostración de galería para maestros.
