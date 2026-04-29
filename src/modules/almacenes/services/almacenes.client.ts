import type { Almacen, CreateAlmacenDto, UpdateAlmacenDto } from '../types';

const BASE = '/api/almacenes';

export const almacenesClientService = {
  async getAll(activo?: boolean): Promise<Almacen[]> {
    const url = activo !== undefined ? `${BASE}?activo=${activo}` : BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar almacenes');
    const json = await res.json();
    return json.data as Almacen[];
  },

  async create(data: CreateAlmacenDto): Promise<Almacen> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear almacén');
    }
    const json = await res.json();
    return json.data as Almacen;
  },

  async update(id: string, data: UpdateAlmacenDto): Promise<Almacen> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar almacén');
    }
    const json = await res.json();
    return json.data as Almacen;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar almacén');
    }
  },
};
