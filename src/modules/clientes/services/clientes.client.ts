import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/clientes';

type GetAllParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const clientesClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Cliente>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar clientes');
    const json = await res.json();
    return json.data as PaginatedResponse<Cliente>;
  },

  async create(data: CreateClienteDto): Promise<Cliente> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear cliente');
    }
    const json = await res.json();
    return json.data as Cliente;
  },

  async update(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar cliente');
    }
    const json = await res.json();
    return json.data as Cliente;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar cliente');
    }
  },
};
