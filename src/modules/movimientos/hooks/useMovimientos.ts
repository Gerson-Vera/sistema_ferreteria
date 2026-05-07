'use client';
import { useState, useEffect, useCallback } from 'react';
import { movimientosClientService } from '../services/movimientos.client';
import type { MovimientoInventario } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<MovimientoInventario> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

type Filters = {
  productoId?: string;
  tipo?: string;
  desde?: string;
  hasta?: string;
};

export function useMovimientos() {
  const [result, setResult] = useState<PaginatedResponse<MovimientoInventario>>(EMPTY);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [filters, setFiltersState] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movimientosClientService.getAll({ page, limit, ...filters });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  const setPage = useCallback((p: number) => { setPageState(p); }, []);
  const setLimit = useCallback((l: number) => { setLimitState(l); setPageState(1); }, []);
  const setFilters = useCallback((f: Filters) => { setFiltersState(f); setPageState(1); }, []);

  return { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, refresh: load };
}
