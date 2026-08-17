import type { Conteo, CreateConteoDto, RegistrarConteoItemDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/conteos-inventario';

type GetAllParams = {
  page?: number;
  limit?: number;
  almacenId?: string;
  estado?: string;
};

async function parseError(res: Response, fallback: string): Promise<never> {
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error ?? fallback);
}

export const conteosInventarioClientService = {
  async getAll(params?: GetAllParams): Promise<PaginatedResponse<Conteo>> {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.set('page', String(params.page));
    if (params?.limit !== undefined) sp.set('limit', String(params.limit));
    if (params?.almacenId) sp.set('almacenId', params.almacenId);
    if (params?.estado) sp.set('estado', params.estado);
    const query = sp.toString();
    const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
    if (!res.ok) await parseError(res, 'Error al cargar conteos');
    const json = await res.json();
    return json.data as PaginatedResponse<Conteo>;
  },

  async create(data: CreateConteoDto): Promise<Conteo> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Error al crear conteo');
    const json = await res.json();
    return json.data as Conteo;
  },

  async registrar(id: string, items: RegistrarConteoItemDto[]): Promise<Conteo> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'registrar', items }),
    });
    if (!res.ok) await parseError(res, 'Error al registrar conteo');
    const json = await res.json();
    return json.data as Conteo;
  },

  async aplicar(id: string): Promise<Conteo> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'aplicar' }),
    });
    if (!res.ok) await parseError(res, 'Error al aplicar conteo');
    const json = await res.json();
    return json.data as Conteo;
  },

  async anular(id: string): Promise<Conteo> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'anular' }),
    });
    if (!res.ok) await parseError(res, 'Error al anular conteo');
    const json = await res.json();
    return json.data as Conteo;
  },
};
