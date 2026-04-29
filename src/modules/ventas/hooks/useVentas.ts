'use client';
import { useState, useEffect, useCallback } from 'react';
import { ventasClientService } from '../services/ventas.client';
import type { Venta } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Venta> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

type Filters = {
  estado?: string;
  desde?: string;
  hasta?: string;
};

export function useVentas() {
  const [result, setResult] = useState<PaginatedResponse<Venta>>(EMPTY);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [filters, setFiltersState] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ventasClientService.getAll({ page, limit, ...filters });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  const setPage = useCallback((p: number) => { setPageState(p); }, []);
  const setLimit = useCallback((l: number) => { setLimitState(l); setPageState(1); }, []);
  const setFilters = useCallback((f: Filters) => { setFiltersState(f); setPageState(1); }, []);

  const anular = async (id: string): Promise<void> => {
    await ventasClientService.anular(id);
    await load();
  };

  return {
    result,
    page,
    limit,
    filters,
    loading,
    error,
    setPage,
    setLimit,
    setFilters,
    refresh: load,
    anular,
  };
}
