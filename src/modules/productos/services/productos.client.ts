import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/productos';

type GetAllParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoriaId?: string;
  activo?: boolean;
};

export const productosClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Producto>> {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.categoriaId) sp.set('categoriaId', params.categoriaId);
    if (params?.activo !== undefined) sp.set('activo', String(params.activo));
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar productos');
    const json = await res.json();
    return json.data as PaginatedResponse<Producto>;
  },

  async create(data: CreateProductoDto): Promise<Producto> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear producto');
    }
    const json = await res.json();
    return json.data as Producto;
  },

  async update(id: string, data: UpdateProductoDto): Promise<Producto> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar producto');
    }
    const json = await res.json();
    return json.data as Producto;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar producto');
  },
};
