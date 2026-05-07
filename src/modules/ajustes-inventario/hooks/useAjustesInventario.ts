'use client';
import { useState, useEffect, useCallback } from 'react';
import { ajustesInventarioClientService } from '../services/ajustes-inventario.client';
import type { AjusteInventario, CreateAjusteInventarioDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<AjusteInventario> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

type Filters = { estado?: string };

export function useAjustesInventario() {
  const [result, setResult] = useState<PaginatedResponse<AjusteInventario>>(EMPTY);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [filters, setFiltersState] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ajustesInventarioClientService.getAll({ page, limit, ...filters });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar ajustes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  const setPage = useCallback((p: number) => { setPageState(p); }, []);
  const setLimit = useCallback((l: number) => { setLimitState(l); setPageState(1); }, []);
  const setFilters = useCallback((f: Filters) => { setFiltersState(f); setPageState(1); }, []);

  const create = async (data: CreateAjusteInventarioDto): Promise<void> => {
    await ajustesInventarioClientService.create(data);
    await load();
  };

  const aplicar = async (id: string): Promise<void> => {
    await ajustesInventarioClientService.aplicar(id);
    await load();
  };

  const anular = async (id: string): Promise<void> => {
    await ajustesInventarioClientService.anular(id);
    await load();
  };

  return { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, refresh: load, create, aplicar, anular };
}
