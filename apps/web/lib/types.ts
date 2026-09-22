/**
 * GWS · Tipos — espejo de los contratos reales del backend NestJS.
 * (Ver: backend src/auth, src/subscriptions, src/marketplace.)
 * Rutas REALES (el backend NO tiene prefijo /v1):
 *   POST /auth/register, POST /auth/login   -> { user, accessToken }
 *   GET  /subscriptions/plans               -> PlansCatalogDto
 *   GET  /subscriptions/quote?galaxy&months -> QuoteDto
 *   GET  /subscriptions/mine                -> UserSubscription[] (auth)
 *   GET  /marketplace/products[?filtros]    -> paginado (auth público)
 *   GET  /marketplace/products/:id          -> Product (público)
 *   GET  /health                            -> HealthDto
 */

export type GwsRole = 'user' | 'verifier' | 'foundation' | 'admin';

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: GwsRole;
  preferredLanguage: 'es' | 'en';
  galaxy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
  privacyAccepted: boolean;
  preferredLanguage: 'es' | 'en';
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export type RegisterInput = RegisterPayload;
export type LoginInput = LoginPayload;

export type LoyaltyPeriod = 1 | 3 | 6 | 12;

export interface PlanDto {
  galaxy: string;
  monthlyPriceUsd: number;
  currency: string;
}

export interface PlansCatalogDto {
  currency: string;
  discounts: { months: number; discountPercent: number }[];
  plans: PlanDto[];
  editable: false;
}

export interface QuoteDto {
  galaxy: string;
  monthlyPriceUsd: number;
  currency: string;
  months: number;
  discountPercent: number;
  perPeriodTotalUsd: number;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface UserSubscription {
  id: string;
  userId: string;
  galaxy: string;
  planId: string | null;
  periodMonths: number;
  discountPercent: number;
  pricePerPeriodUsd: number;
  paidThrough: string;
  status: SubscriptionStatus;
  createdAt: string;
}

export type ProductCategoryTier =
  | 'insumos_criticos'
  | 'pro_tools_machinery'
  | 'servicios_industriales'
  | 'obras_terminadas';

export type UnitOfMeasure = 'kg' | 'tonelada' | 'metro_lineal' | 'unidad' | 'litro';

export interface GwsMediaItem {
  url: string;
  kind: 'image' | 'video' | 'document';
  caption?: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description?: string;
  categoryTier: ProductCategoryTier;
  technicalSpecs: Record<string, unknown>;
  unitPrice: number;
  unitOfMeasure: UnitOfMeasure;
  minimumOrderQuantity?: number;
  requiresMsds: boolean;
  msdsUrl?: string;
  sellerCountryCode: string;
  sellerRegion?: string;
  media?: GwsMediaItem[];
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Forma REAL de GET /marketplace/products (marketplace.service.ts). */
export interface ProductSearchResponse {
  items: MarketplaceProduct[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MarketListParams {
  categoryTier?: ProductCategoryTier;
  countryCode?: string;
  search?: string;
  specs?: Record<string, unknown>;
  coeMin?: number;
  coeMax?: number;
  fusionTempMin?: number;
  fusionTempMax?: number;
  page?: number;
  limit?: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'captured' | 'refunded' | 'failed';
export type PaymentMethod = 'card_usd' | 'usdt_trc20' | 'usdt_polygon';

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface OrderAddressInput {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2 (ej: AR). */
  countryCode: string;
  phone?: string;
}

/** ADR-001: idempotencyKey obligatoria (8–64 chars); reintentos con la
 * misma key devuelven la MISMA orden. */
export interface CreateOrderPayload {
  idempotencyKey: string;
  items: OrderItemInput[];
  address: OrderAddressInput;
  paymentMethod: PaymentMethod;
}

export interface OrderItemOutput {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  quantity: number;
  unitAmount: number;
  lineTotal: number;
}

export interface PaymentOutput {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface OrderResponse {
  id: string;
  buyerId: string;
  status: OrderStatus;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  address: (Omit<OrderAddressInput, 'line2' | 'region' | 'phone'> & {
    id: string;
    line2: string | null;
    region: string | null;
    phone: string | null;
  }) | null;
  items: OrderItemOutput[];
  payments: PaymentOutput[];
  shipmentStatus: string | null;
  createdAt: string;
}

export interface HealthDto {
  status: string;
  db: string;
  version: string;
  timestamp: string;
}

export interface GwsErrorBody {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
}