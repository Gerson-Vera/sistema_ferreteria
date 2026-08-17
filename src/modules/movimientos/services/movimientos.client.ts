import type { MovimientoInventario } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/movimientos';

type GetAllParams = {
  page?: number;
  limit?: number;
  productoId?: string;
  almacenId?: string;
  tipo?: string;
  desde?: string;
  hasta?: string;
};

export const movimientosClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<MovimientoInventario>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.productoId) sp.set('productoId', params.productoId);
    if (params?.almacenId) sp.set('almacenId', params.almacenId);
    if (params?.tipo) sp.set('tipo', params.tipo);
    if (params?.desde) sp.set('desde', params.desde);
    if (params?.hasta) sp.set('hasta', params.hasta);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar movimientos');
    const json = await res.json();
    return json.data as PaginatedResponse<MovimientoInventario>;
  },
};
