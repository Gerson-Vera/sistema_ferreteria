'use client';
import { useState, useEffect, useCallback } from 'react';
import { menusAdminService } from '../services/seguridad.client';
import type { MenuAdmin, CreateMenuDto, UpdateMenuDto } from '../types';

export function useMenusAdmin() {
  const [tree, setTree]       = useState<MenuAdmin[]>([]);
  const [flat, setFlat]       = useState<MenuAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeData, flatData] = await Promise.all([
        menusAdminService.getTree(),
        menusAdminService.getFlat(),
      ]);
      setTree(treeData);
      setFlat(flatData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar menús');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const crear  = async (d: CreateMenuDto)           => { await menusAdminService.create(d);     await load(); };
  const editar = async (id: string, d: UpdateMenuDto) => { await menusAdminService.update(id, d); await load(); };
  const toggle = async (id: string)                  => { await menusAdminService.toggle(id);    await load(); };

  return { tree, flat, loading, error, refresh: load, crear, editar, toggle };
}
