'use client';
import { useState, useEffect, useCallback } from 'react';
import { usuariosAdminService } from '../services/seguridad.client';
import type { UsuarioAdmin, CreateUsuarioDto, UpdateUsuarioDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<UsuarioAdmin> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

type Filters = { search?: string; rolId?: string; estado?: string };

export function useUsuariosAdmin() {
  const [result, setResult]   = useState(EMPTY);
  const [page, setPageState]  = useState(1);
  const [limit, setLimitState] = useState(20);
  const [filters, setFiltersState] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await usuariosAdminService.getAll({ page, limit, ...filters }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  const setPage    = useCallback((p: number) => setPageState(p), []);
  const setLimit   = useCallback((l: number) => { setLimitState(l); setPageState(1); }, []);
  const setFilters = useCallback((f: Filters) => { setFiltersState(f); setPageState(1); }, []);

  const crear   = async (d: CreateUsuarioDto) => { await usuariosAdminService.create(d); await load(); };
  const editar  = async (id: string, d: UpdateUsuarioDto) => { await usuariosAdminService.update(id, d); await load(); };
  const toggle  = async (id: string) => { await usuariosAdminService.toggle(id); await load(); };

  return { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, refresh: load, crear, editar, toggle };
}
