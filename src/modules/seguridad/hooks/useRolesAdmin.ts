'use client';
import { useState, useEffect, useCallback } from 'react';
import { rolesAdminService } from '../services/seguridad.client';
import type { RolAdmin, CreateRolDto, UpdateRolDto } from '../types';

export function useRolesAdmin() {
  const [roles, setRoles]     = useState<RolAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRoles(await rolesAdminService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const crear         = async (d: CreateRolDto) => { await rolesAdminService.create(d); await load(); };
  const editar        = async (id: string, d: UpdateRolDto) => { await rolesAdminService.update(id, d); await load(); };
  const toggle        = async (id: string) => { await rolesAdminService.toggle(id); await load(); };
  const asignarMenus  = async (id: string, menuIds: string[]) => { await rolesAdminService.asignarMenus(id, menuIds); await load(); };

  return { roles, loading, error, refresh: load, crear, editar, toggle, asignarMenus };
}
