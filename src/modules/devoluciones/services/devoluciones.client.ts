import type { Devolucion, CreateDevolucionDto, TipoDevolucion } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/devoluciones';

type GetAllParams = {
  page?: number;
  limit?: number;
  tipo: TipoDevolucion;
  estado?: string;
};

export const devolucionesClientService = {
  async getAll(params: GetAllParams): Promise<PaginatedResponse<Devolucion>> {
    const sp = new URLSearchParams();
    sp.set('tipo', params.tipo);
    if (params.page !== undefined) sp.set('page', String(params.page));
    if (params.limit !== undefined) sp.set('limit', String(params.limit));
    if (params.estado) sp.set('estado', params.estado);
    const res = await fetch(`${BASE}?${sp.toString()}`);
    if (!res.ok) throw new Error('Error al cargar devoluciones');
    const json = await res.json();
    return json.data as PaginatedResponse<Devolucion>;
  },

  async create(data: CreateDevolucionDto): Promise<Devolucion> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al registrar devolución');
    }
    const json = await res.json();
    return json.data as Devolucion;
  },

  async anular(id: string, tipo: TipoDevolucion): Promise<Devolucion> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'anular', tipo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al anular devolución');
    }
    const json = await res.json();
    return json.data as Devolucion;
  },
};
