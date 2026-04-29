import type { Marca, CreateMarcaDto, UpdateMarcaDto } from '../types';

const BASE = '/api/marcas';

export const marcasClientService = {
  async getAll(activo?: boolean): Promise<Marca[]> {
    const url = activo !== undefined ? `${BASE}?activo=${activo}` : BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar marcas');
    const json = await res.json();
    return json.data as Marca[];
  },

  async create(data: CreateMarcaDto): Promise<Marca> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear marca');
    }
    const json = await res.json();
    return json.data as Marca;
  },

  async update(id: string, data: UpdateMarcaDto): Promise<Marca> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar marca');
    }
    const json = await res.json();
    return json.data as Marca;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar marca');
    }
  },
};
