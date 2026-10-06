'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { G2ListParams, G2ProductsPage, MarketplaceProduct, PlansCatalogDto, ProductSearchResponse, PublicUser } from '@/lib/types';

export type CategoryTier = 'insumos_criticos' | 'pro_tools_machinery' | 'servicios_industriales' | 'obras_terminadas';

export interface MarketplaceFilters {
  categoryTier?: CategoryTier;
  search?: string;
  countryCode?: string;
  page?: number;
  limit?: number;
}

/** Query-string para GET /g2/products (spec g2-listado): omite filtros vacíos. */
export function g2Key(filters: G2ListParams): string {
  const sp = new URLSearchParams();
  if (filters.category) sp.set('category', filters.category);
  if (filters.brand?.trim()) sp.set('brand', filters.brand.trim());
  if (filters.priceMin !== undefined && Number.isFinite(filters.priceMin)) sp.set('price_min', String(filters.priceMin));
  if (filters.priceMax !== undefined && Number.isFinite(filters.priceMax)) sp.set('price_max', String(filters.priceMax));
  sp.set('page', String(filters.page ?? 1));
  sp.set('limit', String(filters.limit ?? 12));
  return `/g2/products?${sp.toString()}`;
}

export function useG2Products(filters: G2ListParams) {
  const key = g2Key(filters);
  const { data, error, isLoading } = useSWR<G2ProductsPage>(key, (k: string) => api.get<G2ProductsPage>(k), {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
  const page = data?.page ?? 1;
  const pageSize = data?.pageSize ?? filters.limit ?? 12;
  return {
    products: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    hasMore: page * pageSize < (data?.total ?? 0),
    loading: isLoading,
    error,
  };
}

function catalogKey(filters: MarketplaceFilters) {
  const sp = new URLSearchParams();
  if (filters.categoryTier) sp.set('categoryTier', filters.categoryTier);
  if (filters.search) sp.set('search', filters.search);
  if (filters.countryCode) sp.set('countryCode', filters.countryCode);
  sp.set('page', String(filters.page ?? 1));
  sp.set('limit', String(filters.limit ?? 20));
  const qs = sp.toString();
  return qs ? `/marketplace/products?${qs}` : '/marketplace/products';
}

export function useMarketplace(filters: MarketplaceFilters) {
  const key = catalogKey(filters);
  const { data, error, isLoading } = useSWR<ProductSearchResponse>(key, (k: string) => api.get<ProductSearchResponse>(k), {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
  return { products: data?.items ?? [], total: data?.total ?? 0, page: data?.page ?? 1, hasMore: data?.hasMore ?? false, loading: isLoading, error };
}

export function useProduct(id: string) {
  const { data, error, isLoading } = useSWR<MarketplaceProduct>(`/marketplace/products/${id}`, (k: string) => api.get<MarketplaceProduct>(k));
  return { product: data, loading: isLoading, error };
}

export function usePlans() {
  const { data, error, isLoading } = useSWR<PlansCatalogDto>('/subscriptions/plans', (k: string) => api.get<PlansCatalogDto>(k), {
    revalidateOnFocus: false,
  });
  return { catalog: data, loading: isLoading, error };
}

export async function quoteSubscription(galaxy: string, months: number) {
  return api.get(`/subscriptions/quote?galaxy=${encodeURIComponent(galaxy)}&months=${months}`);
}

export function useSubscriptions(user: PublicUser | null | undefined) {
  const enabled = !!user;
  const { data, error, isLoading } = useSWR(enabled ? '/subscriptions/mine' : null, (k: string) =>
    api.get(k, { viaGateway: true }),
  );
  return { subs: data, loading: isLoading, error };
}