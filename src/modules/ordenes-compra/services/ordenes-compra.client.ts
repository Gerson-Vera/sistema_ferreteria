import type { OrdenCompra, OrdenCompraResumen, CreateOrdenCompraDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/ordenes-compra';

type GetAllParams = {
  page?: number;
  limit?: number;
  estado?: string;
  proveedorId?: string;
  search?: string;
};

export const ordenesCompraClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<OrdenCompraResumen>> {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.estado) sp.set('estado', params.estado);
    if (params?.proveedorId) sp.set('proveedorId', params.proveedorId);
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString();
    const res = await fetch(`${BASE}${q ? '?' + q : ''}`);
    if (!res.ok) throw new Error('Error al cargar órdenes');
    const json = await res.json();
    return json.data as PaginatedResponse<OrdenCompraResumen>;
  },

  async getById(id: string): Promise<OrdenCompra> {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Orden no encontrada');
    const json = await res.json();
    return json.data as OrdenCompra;
  },

  async create(data: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear orden');
    }
    const json = await res.json();
    return json.data as OrdenCompra;
  },

  async enviar(id: string): Promise<OrdenCompra> {
    const res = await fetch(`${BASE}/${id}/enviar`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al enviar orden');
    }
    const json = await res.json();
    return json.data as OrdenCompra;
  },

  async recibir(id: string) {
    const res = await fetch(`${BASE}/${id}/recibir`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al recibir orden');
    }
    const json = await res.json();
    return json.data;
  },

  async anular(id: string): Promise<OrdenCompra> {
    const res = await fetch(`${BASE}/${id}/anular`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al anular orden');
    }
    const json = await res.json();
    return json.data as OrdenCompra;
  },
};
