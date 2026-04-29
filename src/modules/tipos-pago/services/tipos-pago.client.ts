import type { TipoPago, CreateTipoPagoDto, UpdateTipoPagoDto } from '../types';

const BASE = '/api/tipos-pago';

export const tiposPagoClientService = {
  async getAll(activo?: boolean): Promise<TipoPago[]> {
    const url = activo !== undefined ? `${BASE}?activo=${activo}` : BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar tipos de pago');
    const json = await res.json();
    return json.data as TipoPago[];
  },

  async create(data: CreateTipoPagoDto): Promise<TipoPago> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear tipo de pago');
    }
    const json = await res.json();
    return json.data as TipoPago;
  },

  async update(id: string, data: UpdateTipoPagoDto): Promise<TipoPago> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar tipo de pago');
    }
    const json = await res.json();
    return json.data as TipoPago;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Error al eliminar tipo de pago');
    }
  },
};
