import type { Transferencia, CreateTransferenciaDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/transferencias';

type GetAllParams = {
  page?: number;
  limit?: number;
  estado?: string;
  almacenId?: string;
};

async function accion(id: string, accion: 'enviar' | 'recibir' | 'anular'): Promise<Transferencia> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error al ${accion} transferencia`);
  }
  const json = await res.json();
  return json.data as Transferencia;
}

export const transferenciasClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Transferencia>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.estado) sp.set('estado', params.estado);
    if (params?.almacenId) sp.set('almacenId', params.almacenId);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Error al cargar transferencias');
    const json = await res.json();
    return json.data as PaginatedResponse<Transferencia>;
  },

  async create(data: CreateTransferenciaDto): Promise<Transferencia> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al crear transferencia');
    }
    const json = await res.json();
    return json.data as Transferencia;
  },

  enviar: (id: string) => accion(id, 'enviar'),
  recibir: (id: string) => accion(id, 'recibir'),
  anular: (id: string) => accion(id, 'anular'),
};
