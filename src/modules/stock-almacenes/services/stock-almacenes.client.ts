import type { StockAlmacen } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/stock-almacenes';

type GetAllParams = {
  page?: number;
  limit?: number;
  almacenId?: string;
  productoId?: string;
  search?: string;
};

export const stockAlmacenesClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<StockAlmacen>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.almacenId) sp.set('almacenId', params.almacenId);
    if (params?.productoId) sp.set('productoId', params.productoId);
    if (params?.search) sp.set('search', params.search);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar stock por almacén');
    const json = await res.json();
    return json.data as PaginatedResponse<StockAlmacen>;
  },
};
