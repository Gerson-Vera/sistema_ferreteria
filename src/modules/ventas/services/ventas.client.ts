import type { Venta, CreateVentaDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/ventas';

type GetAllParams = {
  page?: number;
  limit?: number;
  clienteId?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
};

export const ventasClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Venta>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.clienteId) sp.set('clienteId', params.clienteId);
    if (params?.estado) sp.set('estado', params.estado);
    if (params?.desde) sp.set('desde', params.desde);
    if (params?.hasta) sp.set('hasta', params.hasta);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar ventas');
    const json = await res.json();
    return json.data as PaginatedResponse<Venta>;
  },

  async create(data: CreateVentaDto): Promise<Venta> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear venta');
    }
    const json = await res.json();
    return json.data as Venta;
  },

  async anular(id: string): Promise<Venta> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al anular venta');
    }
    const json = await res.json();
    return json.data as Venta;
  },
};
