# Arquitectura Logística del Marketplace — Glass World Studio

> **Flecha 3** — Cómo se mueve el vidrio dentro de la plataforma.
> Principio rector: **GWS es un facilitador liviano**. No tiene stock, no tiene flota y **no
> absorbe el costo de la entrega final**.
> Última actualización: 16-10-2026

Este documento define **cómo** se mueve la mercadería cuando hay una transacción. No es
outreach (para eso ver la flecha `logistica` del generador): es el **diseño operativo**.

---

## 1. Principio rector (no negociable)

> **La logística y el costo de entrega final corren siempre por cuenta de la operación**
> (el comprador o el vendedor, según se pacte). La plataforma **conecta, cotiza y ordena**,
> pero no transporta ni almacena.

Consecuencias de diseño:

- **Sin inventario:** GWS nunca es dueño de la mercadería.
- **Sin flota:** los envíos los ejecutan **operadores logísticos aliados**.
- **Escalable:** crecer no cuesta camiones ni depósitos.
- **Transparente:** el costo logístico se muestra antes de cerrar, sin sorpresas.

---

## 2. El universo a mover (tipos de carga)

El vidrio no es una sola cosa. Cada familia tiene un perfil de riesgo distinto:

| Familia | Ejemplos | Fragilidad | Peso/Volumen | Nota |
|---|---|---|---|---|
| **Vidrio artístico** | Piezas de autor, esculturas, vitrales | Máxima | Bajo/Medio | Pieza **única**: no se reemplaza. |
| **Vidrio plano** | Templado, laminado, cortes a medida | Alta | Alto | Se mueve en **caballete (A-frame)**. |
| **Envases** | Botellas, frascos, ampollas | Alta | Medio | Volumen alto, valor unitario bajo. |
| **Materia prima** | Arena sílice, soda ash, calcín, colorantes | Baja | Muy alto | A granel: sacos, big bags, pallets. |
| **Refractarios / horno** | Ladrillos, crisoles, componentes | Media | Muy alto | Pesado y moldeado. |
| **Herramienta / equipo** | Sopletes, hornos, máquinas | Baja | Medio | Sobredimensionado a veces. |

---

## 3. La matriz de decisión (fragilidad × valor × peso)

La combinación define **empaque** y **modo de transporte**:

```
                    ALTO VALOR
                        │
     Aéreo / arte       │       Courier asegurado
     especializado      │       (pieza chica, frágil)
                        │
  ──────────────────────┼──────────────────────
                        │
     Marítimo (export)  │       Terrestre LTL/FTL
     + crating          │       (pallet / plano)
                        │
                    BAJO VALOR
        PESADO ─────────┴───────── LIVIANO
```

---

## 4. Empaque técnico (packaging)

Regla de oro: **la superficie del vidrio nunca toca otra superficie dura**.

| Caso | Empaque |
|---|---|
| Pieza artística chica | Doble caja + espuma a medida + papel libre de ácido. |
| Vidrio plano / cortes | **Caballete A-frame** + caja de madera (**crating**) + esquineros. |
| Envases / volumen | Celdas separadoras + film + pallet flejado. |
| Materia prima | Sacos / big bags sobre pallet + film estirable. |
| Refractarios | Separadores + pallet reforzado + flejes. |

**Nunca:** film/burbuja directo sobre la superficie del vidrio sin separador; piezas sueltas
dentro de una caja sin inmovilizar.

---

## 5. Modos de transporte y cuándo usar cada uno

| Modo | Cuándo | Cobertura |
|---|---|---|
| **Courier / paquetería** | Piezas chicas, alto valor, urgente | Puerta a puerta, global |
| **Terrestre LTL / FTL** | Pallets, vidrio plano, regional | Nacional / regional |
| **Marítimo** | Export, materia prima, volumen | Global (contenedor) |
| **Aéreo** | Alto valor o urgencia extrema | Global (caro) |
| **Arte especializado** | Piezas de museo / colección | Operadores especializados |

---

## 6. El flujo dentro de la plataforma

```
1. PUBLICACIÓN     El vendedor publica la pieza (peso, dimensiones, fragilidad, origen/destino)
2. COTIZACIÓN      El motor pide cotización a los operadores aliados (o el vendedor la carga)
3. ELECCIÓN        Comprador y vendedor eligen operador y aceptan el costo (siempre de la operación)
4. CONTRATACIÓN    Se genera la orden de retiro con el operador
5. DESPACHO        Retiro en origen + fotos del estado + rótulos de fragilidad
6. TRACKING        Seguimiento visible en la plataforma
7. RECEPCIÓN       Confirmación de entrega + estado + seguro si hubo siniestro
```

---

## 7. Reparto de responsabilidades (RACI simplificado)

| Actividad | Vendedor | Comprador | Operador | Plataforma (GWS) |
|---|---|---|---|---|
| Empaque correcto | **R** | — | C | I |
| Cotización | C | C | **R** | **A** |
| Pago del flete | C | **R** | — | I |
| Transporte | — | — | **R** | I |
| Seguro de carga | C | C | C | I |
| Trazabilidad | I | I | C | **R** |
| Reclamos | C | C | **R** | **A** |

*(R = responsable · A = aprueba/coordina · C = consultado · I = informado)*

---

## 8. Seguros y siniestros

- El **seguro de carga** es responsabilidad de quien paga el envío (o se contrata aparte).
- **Antes de despachar:** fotos del estado y del empaque. Sin fotos, no hay reclamo.
- La plataforma documenta el siniestro, pero **no indemniza**: media entre las partes.

---

## 9. Documentación y trazabilidad

Guía de transporte · remito · **packing list** · declaración de valor · documentación de
exportación (cuando cruza fronteras). Todo adjunto a la orden dentro de la plataforma.

---

## 10. Lo que la plataforma NO hace (guardarraíles)

- ❌ No es dueña de la mercadería.
- ❌ No transporta (lo hacen los operadores aliados).
- ❌ No almacena (no hay depósito propio).
- ❌ No absorbe el costo del flete.
- ❌ No indemniza siniestros (media, no asegura).

---

## 11. Métricas iniciales a observar

| Métrica | Para qué |
|---|---|
| Tiempo de cotización | Que no frene la compra. |
| % de siniestros por familia | Dónde reforzar empaque. |
| Costo logístico promedio por familia | Transparencia para el usuario. |
| Adopción de operadores aliados | Densidad de la red. |

---

## 12. Pendientes internos

- `[COMPLETAR]` Definir la integración de cotización (¿API de operadores o carga manual?).
- `[COMPLETAR]` Política de reclamos con plazos concretos.
- `[COMPLETAR]` Operadores por región (ver la matriz de proveedores).
- `[COMPLETAR]` ¿Se cobra comisión por transacción? (modelo de ingresos, aún abierto).
