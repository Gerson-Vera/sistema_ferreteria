import type { UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../types';

const BASE = '/api/unidades-medida';

export const unidadesMedidaClientService = {
  async getAll(activo?: boolean): Promise<UnidadMedida[]> {
    const url = activo !== undefined ? `${BASE}?activo=${activo}` : BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar unidades de medida');
    const json = await res.json();
    return json.data as UnidadMedida[];
  },

  async create(data: CreateUnidadMedidaDto): Promise<UnidadMedida> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear unidad de medida');
    }
    const json = await res.json();
    return json.data as UnidadMedida;
  },

  async update(id: string, data: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar unidad de medida');
    }
    const json = await res.json();
    return json.data as UnidadMedida;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar unidad de medida');
    }
  },
};
