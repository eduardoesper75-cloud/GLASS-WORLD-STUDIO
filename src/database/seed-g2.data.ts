import { ProductCategoryTier, UnitOfMeasure } from '../marketplace/marketplace.enums';

/**
 * GWS · Datos seed de G2 (spec g2-listado, CA2)
 * ------------------------------------------------------------
 * Solo desarrollo (`npm run seed:g2`, con guard de DB). Marcas y
 * precios son de ejemplo — [S] hasta que Jorge ratifique catálogo
 * real; NO son datos de producción y el runner se niega a correr
 * fuera de gws_dev salvo GWS_SEED_ALLOW=1.
 *
 * Cobertura mínima exigida por CA2: >= 40 productos, las 4
 * categorías (categoryTier) y >= 5 marcas distintas. `coe` y
 * `voltaje` cumplen REQUIRED_SPECS_BY_TIER (marketplace.service).
 * UnitOfMeasure es el enum real del repo (no existe "m2": los
 * pliegos se pesan en kg y los servicios se facturan por unidad).
 */
export interface G2SeedProduct {
  name: string;
  description: string;
  categoryTier: ProductCategoryTier;
  brand: string | null;
  unitPrice: number;
  unitOfMeasure: UnitOfMeasure;
  technicalSpecs: Record<string, unknown>;
  minimumOrderQuantity?: number;
}

const INS = ProductCategoryTier.INSUMOS_CRITICOS;
const MAC = ProductCategoryTier.PRO_TOOLS_MACHINERY;
const SER = ProductCategoryTier.SERVICIOS_INDUSTRIALES;
const OBR = ProductCategoryTier.OBRAS_TERMINADAS;

export const G2_SEED_PRODUCTS: G2SeedProduct[] = [
  // ---- INSUMOS_CRITICOS (12) — specs: coe obligatorio ----
  { name: 'Varilla sodalima incolora 6mm COE 92', description: 'Varilla para soplado y vitral, tirada continua.', categoryTier: INS, brand: 'Sintec', unitPrice: 4.2, unitOfMeasure: UnitOfMeasure.METRO_LINEAL, technicalSpecs: { coe: 92, color: 'incoloro', diametro_mm: 6 } },
  { name: 'Varilla borosilicato 8mm COE 33', description: 'Alta resistencia térmica, laboratorio y lámparas.', categoryTier: INS, brand: 'Schott', unitPrice: 12.5, unitOfMeasure: UnitOfMeasure.METRO_LINEAL, technicalSpecs: { coe: 33, color: 'incoloro', diametro_mm: 8 } },
  { name: 'Tubo vidrio 12mm COE 92', description: 'Tubo para neon y estructuras ligeras.', categoryTier: INS, brand: 'Sintec', unitPrice: 6.8, unitOfMeasure: UnitOfMeasure.METRO_LINEAL, technicalSpecs: { coe: 92, color: 'incoloro', diametro_mm: 12 } },
  { name: 'Frita esmalte opalino 1kg', description: 'Esmalte para serigrafía sobre vidrio.', categoryTier: INS, brand: 'Guardian', unitPrice: 18.0, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 96, color: 'opalino' } },
  { name: 'Sílice fundida granel 25kg', description: 'Materia prima de alta pureza para fusión.', categoryTier: INS, brand: 'Saint-Gobain', unitPrice: 3.9, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 0, pureza_pct: 99.5 } },
  { name: 'Float incoloro 4mm (por kg)', description: 'Hoja flotada estándar, corte a pedido.', categoryTier: INS, brand: 'Pilkington', unitPrice: 2.4, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 86, espesor_mm: 4 } },
  { name: 'Float gris 6mm (por kg)', description: 'Vidrio solar gris para fachadas.', categoryTier: INS, brand: 'Pilkington', unitPrice: 3.1, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 86, espesor_mm: 6, color: 'gris' } },
  { name: 'Laminado PVB 33.1 6mm', description: 'Seguridad laminada para carpintería.', categoryTier: INS, brand: 'Saint-Gobain', unitPrice: 5.6, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 86, espesor_mm: 6, laminado: 'PVB' } },
  { name: 'Polvo de cerio para pulido 1kg', description: 'Abrasivo de precisión para pulido químico.', categoryTier: INS, brand: 'Saint-Gobain', unitPrice: 42.0, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 0, granulometria_um: 1.5 } },
  { name: 'Negro de cátodo serigráfico 1kg', description: 'Tinta cerámica para marcas y back-painting.', categoryTier: INS, brand: 'Pilkington', unitPrice: 27.5, unitOfMeasure: UnitOfMeasure.KG, technicalSpecs: { coe: 96, color: 'negro' } },
  { name: 'Adhesivo silicónico estructural 310ml', description: 'Sellado estructural para ensamble de vidrio.', categoryTier: INS, brand: 'Sintec', unitPrice: 8.8, unitOfMeasure: UnitOfMeasure.LITRO, technicalSpecs: { coe: 96, tipo: 'silicona' }, minimumOrderQuantity: 1 },
  { name: 'Cinta de butilo 15mm', description: 'Laminado intermedio para vidrio aislante.', categoryTier: INS, brand: 'Saint-Gobain', unitPrice: 1.8, unitOfMeasure: UnitOfMeasure.METRO_LINEAL, technicalSpecs: { coe: 96, ancho_mm: 15 } },

  // ---- PRO_TOOLS_MACHINERY (10) — specs: voltaje obligatorio ----
  { name: 'Horno de fusión 40kW', description: 'Cámara de fusión para taller medio.', categoryTier: MAC, brand: 'Nabertherm', unitPrice: 4800, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 380, potencia_kw: 40, capacidad_kg: 30 } },
  { name: 'Horno de recocido 12kW', description: 'Annealing controlado por curva.', categoryTier: MAC, brand: 'Nabertherm', unitPrice: 3900, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 220, potencia_kw: 12, capacidad_kg: 18 } },
  { name: 'Esmeril horizontal 1.5kW', description: 'Bordeadora de banco con muela diamantada.', categoryTier: MAC, brand: 'Bohle', unitPrice: 1250, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 220, potencia_kw: 1.5 } },
  { name: 'CNC corte por agua 3 ejes', description: 'Mesa de corte por chorro de agua con control numérico.', categoryTier: MAC, brand: 'Bohle', unitPrice: 9800, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 380, ejes: 3, mesa_mm: '2000x3000' } },
  { name: 'Taladro de vidrio diamantado 800W', description: 'Perforadora con refrigeración por agua.', categoryTier: MAC, brand: 'Bohle', unitPrice: 640, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 220, potencia_w: 800 } },
  { name: 'Pulidora neumática 125mm', description: 'Pulido de bordes con aire comprimido.', categoryTier: MAC, brand: 'Bohle', unitPrice: 420, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 0, presion_bar: 6 } },
  { name: 'Mesa de corte manual 3m', description: 'Mesa con succión y brazo de corte.', categoryTier: MAC, brand: 'Sintec', unitPrice: 2300, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 0, largo_m: 3 } },
  { name: 'Horno de temple 3m', description: 'Templado horizontal para placas grandes.', categoryTier: MAC, brand: 'Nabertherm', unitPrice: 7600, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 380, capacidad_m: 3 } },
  { name: 'Generador de vapor para grabado', description: 'Humo de ácido para decoración de superficie.', categoryTier: MAC, brand: 'Bohle', unitPrice: 1450, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 220, capacidad_l: 5 } },
  { name: 'Rectificadora de bordes 2.5m', description: 'Bordes rectos y biselados en línea.', categoryTier: MAC, brand: 'Nabertherm', unitPrice: 5400, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { voltaje: 380, largo_m: 2.5 } },

  // ---- SERVICIOS_INDUSTRIALES (9) — sin specs obligatorias ----
  { name: 'Corte CNC por medida', description: 'Corte de placas a plano del cliente.', categoryTier: SER, brand: null, unitPrice: 85, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { tolerancia_mm: 0.5 } },
  { name: 'Templado térmico', description: 'Seguridad para pasamanos y divisiones.', categoryTier: SER, brand: null, unitPrice: 60, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { norma: 'ASTM C1048' } },
  { name: 'Laminado PVB a medida', description: 'Vidrio de seguridad laminado multiusos.', categoryTier: SER, brand: null, unitPrice: 140, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { capas: 2 } },
  { name: 'Grabado ácido', description: 'Decoración mate permanente.', categoryTier: SER, brand: null, unitPrice: 95, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { profundidad: 'media' } },
  { name: 'Serigrafía decorativa', description: 'Diseño a tinta cerámica sobrevidrio.', categoryTier: SER, brand: null, unitPrice: 70, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { colores_max: 4 } },
  { name: 'Perfilado y deborde', description: 'Bordes pulidos y esquinas ahusadas.', categoryTier: SER, brand: null, unitPrice: 45, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { acabado: 'pulido' } },
  { name: 'Instalación en obra', description: 'Cuadrilla con fijaciones y sellado.', categoryTier: SER, brand: null, unitPrice: 120, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { personal: 2 } },
  { name: 'Ingeniería de medida para fachadas', description: 'Relevamiento, planos y presupuesto por vidrio.', categoryTier: SER, brand: null, unitPrice: 350, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { entregables: 'planos+presupuesto' } },
  { name: 'Reparación de sellos', description: 'Cambio de butilo y silicón en vidrio aislante.', categoryTier: SER, brand: null, unitPrice: 55, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { garantia_meses: 12 } },

  // ---- OBRAS_TERMINADAS (9) — sin specs obligatorias ----
  { name: "Vitral 'Aurora Austral' 60x90", description: 'Pieza de autor en vidrio soplado y plomo.', categoryTier: OBR, brand: 'Taller Vidrio Sur', unitPrice: 480, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { alto_cm: 60, ancho_cm: 90 } },
  { name: "Panel floral fumé 50x70", description: 'Panel decorativo con flores prensadas.', categoryTier: OBR, brand: 'Taller Vidrio Sur', unitPrice: 390, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { alto_cm: 50, ancho_cm: 70 } },
  { name: 'Lámpara soplada única', description: 'Pantalla de vidrio soplado con burbujas.', categoryTier: OBR, brand: 'Taller Vidrio Sur', unitPrice: 260, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { diametro_cm: 35 } },
  { name: 'Espejo biselado artesanal 80x120', description: 'Bisel polido a mano con motivos grabados.', categoryTier: OBR, brand: 'Taller Vidrio Sur', unitPrice: 340, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { alto_cm: 120, ancho_cm: 80 } },
  { name: 'Bandeja de vidrio templado', description: 'Bandeja servidora con asas de latón.', categoryTier: OBR, brand: 'Estudio Fuego', unitPrice: 95, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { largo_cm: 45 } },
  { name: 'Jarrón de vidrio reciclado', description: 'Pieza única de reciclaje creativo.', categoryTier: OBR, brand: 'Estudio Fuego', unitPrice: 130, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { alto_cm: 28 } },
  { name: 'Mesa de centro con vitral', description: ' tapa de vitral en estructura de acero.', categoryTier: OBR, brand: 'Taller Vidrio Sur', unitPrice: 720, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { alto_cm: 45, ancho_cm: 110 } },
  { name: 'Puerta de vidrio grabado', description: 'Puerta interior con grabado botánico.', categoryTier: OBR, brand: 'Estudio Fuego', unitPrice: 560, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { alto_cm: 210, ancho_cm: 90 } },
  { name: 'Cúpula de vidrio para tragaluz', description: 'Cúpula faceteada con rejas de plomo.', categoryTier: OBR, brand: 'Taller Vidrio Sur', unitPrice: 980, unitOfMeasure: UnitOfMeasure.UNIDAD, technicalSpecs: { diametro_cm: 120 } },
];
