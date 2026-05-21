import type { Compra, CreateCompraDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/compras';

type GetAllParams = {
  page?: number;
  limit?: number;
  proveedorId?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
};

export const comprasClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Compra>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.proveedorId) sp.set('proveedorId', params.proveedorId);
    if (params?.estado) sp.set('estado', params.estado);
    if (params?.desde) sp.set('desde', params.desde);
    if (params?.hasta) sp.set('hasta', params.hasta);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar compras');
    const json = await res.json();
    return json.data as PaginatedResponse<Compra>;
  },

  async create(data: CreateCompraDto): Promise<Compra> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear compra');
    }
    const json = await res.json();
    return json.data as Compra;
  },

  async recibir(id: string, itemsRecibidos?: string[]): Promise<Compra> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'recibir', itemsRecibidos }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al recibir compra');
    }
    const json = await res.json();
    return json.data as Compra;
  },

  async anular(id: string): Promise<Compra> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'anular' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al anular compra');
    }
    const json = await res.json();
    return json.data as Compra;
  },
};
