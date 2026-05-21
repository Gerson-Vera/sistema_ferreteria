import type { UsuarioAdmin, RolAdmin, MenuAdmin, CreateUsuarioDto, UpdateUsuarioDto, CreateRolDto, UpdateRolDto, CreateMenuDto, UpdateMenuDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const BASE = '/api/admin';

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return (json as { data: T }).data;
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
type GetUsuariosParams = { page?: number; limit?: number; search?: string; rolId?: string; estado?: string };

export const usuariosAdminService = {
  getAll(params?: GetUsuariosParams): Promise<PaginatedResponse<UsuarioAdmin>> {
    const sp = new URLSearchParams();
    if (params?.page)   sp.set('page',   String(params.page));
    if (params?.limit)  sp.set('limit',  String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.rolId)  sp.set('rolId',  params.rolId);
    if (params?.estado) sp.set('estado', params.estado);
    const q = sp.toString();
    return call(`${BASE}/usuarios${q ? '?' + q : ''}`);
  },
  create(data: CreateUsuarioDto): Promise<UsuarioAdmin> {
    return call(`${BASE}/usuarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  update(id: string, data: UpdateUsuarioDto): Promise<UsuarioAdmin> {
    return call(`${BASE}/usuarios/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  toggle(id: string): Promise<UsuarioAdmin> {
    return call(`${BASE}/usuarios/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'toggle' }) });
  },
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export const rolesAdminService = {
  getAll(): Promise<RolAdmin[]> {
    return call(`${BASE}/roles`);
  },
  create(data: CreateRolDto): Promise<RolAdmin> {
    return call(`${BASE}/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  update(id: string, data: UpdateRolDto): Promise<RolAdmin> {
    return call(`${BASE}/roles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  toggle(id: string): Promise<RolAdmin> {
    return call(`${BASE}/roles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'toggle' }) });
  },
  asignarMenus(id: string, menuIds: string[]): Promise<RolAdmin> {
    return call(`${BASE}/roles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menus: menuIds }) });
  },
};

// ── Menús ─────────────────────────────────────────────────────────────────────
export const menusAdminService = {
  getTree(): Promise<MenuAdmin[]> {
    return call(`${BASE}/menus`);
  },
  getFlat(): Promise<MenuAdmin[]> {
    return call(`${BASE}/menus?flat=1`);
  },
  create(data: CreateMenuDto): Promise<MenuAdmin> {
    return call(`${BASE}/menus`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  update(id: string, data: UpdateMenuDto): Promise<MenuAdmin> {
    return call(`${BASE}/menus/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  },
  toggle(id: string): Promise<MenuAdmin> {
    return call(`${BASE}/menus/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'toggle' }) });
  },
};
