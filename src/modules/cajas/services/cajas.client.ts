import type { Caja, CreateCajaDto, UpdateCajaDto } from '../types';

const BASE = '/api/cajas';

export const cajasClientService = {
  async getAll(activo?: boolean): Promise<Caja[]> {
    const url = activo !== undefined ? `${BASE}?activo=${activo}` : BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar cajas');
    const json = await res.json();
    return json.data as Caja[];
  },

  async create(data: CreateCajaDto): Promise<Caja> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear caja');
    }
    const json = await res.json();
    return json.data as Caja;
  },

  async update(id: string, data: UpdateCajaDto): Promise<Caja> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar caja');
    }
    const json = await res.json();
    return json.data as Caja;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar caja');
    }
  },
};
