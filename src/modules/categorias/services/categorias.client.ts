import type { Categoria, CategoriaConfig, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

const BASE = '/api/categorias';

export const categoriasClientService = {
  async getAll(): Promise<Categoria[]> {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Error al cargar categorías');
    const json = await res.json();
    return json.data as Categoria[];
  },

  async create(data: CreateCategoriaDto): Promise<Categoria> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear categoría');
    }
    const json = await res.json();
    return json.data as Categoria;
  },

  async update(id: string, data: UpdateCategoriaDto): Promise<Categoria> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar categoría');
    }
    const json = await res.json();
    return json.data as Categoria;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar categoría');
    }
  },

  async getConfig(id: string): Promise<CategoriaConfig> {
    const res = await fetch(`${BASE}/${id}/config`);
    if (!res.ok) throw new Error('Error al cargar configuración');
    const json = await res.json();
    return json.data as CategoriaConfig;
  },

  async setConfig(id: string, data: CategoriaConfig): Promise<void> {
    const res = await fetch(`${BASE}/${id}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al guardar configuración');
    }
  },
};
