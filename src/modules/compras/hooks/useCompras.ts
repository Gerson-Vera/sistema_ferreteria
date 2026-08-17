'use client';
import { useState, useEffect, useCallback } from 'react';
import { comprasClientService } from '../services/compras.client';
import type { Compra, RecibirCompraItemDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Compra> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

type Filters = {
  estado?: string;
  desde?: string;
  hasta?: string;
};

export function useCompras() {
  const [result, setResult] = useState<PaginatedResponse<Compra>>(EMPTY);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [filters, setFiltersState] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await comprasClientService.getAll({ page, limit, ...filters });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar compras');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  const setPage = useCallback((p: number) => { setPageState(p); }, []);
  const setLimit = useCallback((l: number) => { setLimitState(l); setPageState(1); }, []);
  const setFilters = useCallback((f: Filters) => { setFiltersState(f); setPageState(1); }, []);

  const recibir = async (id: string, items?: RecibirCompraItemDto[]): Promise<void> => {
    await comprasClientService.recibir(id, items);
    await load();
  };

  const anular = async (id: string): Promise<void> => {
    await comprasClientService.anular(id);
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
    recibir,
    anular,
  };
}
