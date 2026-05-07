import type { AjusteInventario, CreateAjusteInventarioDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/ajustes-inventario';

type GetAllParams = {
  page?: number;
  limit?: number;
  estado?: string;
};

export const ajustesInventarioClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<AjusteInventario>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.estado) sp.set('estado', params.estado);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar ajustes de inventario');
    const json = await res.json();
    return json.data as PaginatedResponse<AjusteInventario>;
  },

  async create(data: CreateAjusteInventarioDto): Promise<AjusteInventario> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear ajuste');
    }
    const json = await res.json();
    return json.data as AjusteInventario;
  },

  async aplicar(id: string): Promise<AjusteInventario> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aplicar' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al aplicar ajuste');
    }
    const json = await res.json();
    return json.data as AjusteInventario;
  },

  async anular(id: string): Promise<AjusteInventario> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'anular' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al anular ajuste');
    }
    const json = await res.json();
    return json.data as AjusteInventario;
  },
};
