import type { Despacho, CreateDespachoDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/despachos';

type GetAllParams = {
  page?: number;
  limit?: number;
  estado?: string;
};

async function accion(id: string, accion: 'avanzar' | 'anular'): Promise<Despacho> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Error al actualizar despacho');
  }
  const json = await res.json();
  return json.data as Despacho;
}

export const despachosClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Despacho>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.estado) sp.set('estado', params.estado);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar despachos');
    const json = await res.json();
    return json.data as PaginatedResponse<Despacho>;
  },

  async create(data: CreateDespachoDto): Promise<Despacho> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear despacho');
    }
    const json = await res.json();
    return json.data as Despacho;
  },

  avanzar: (id: string) => accion(id, 'avanzar'),
  anular: (id: string) => accion(id, 'anular'),
};
