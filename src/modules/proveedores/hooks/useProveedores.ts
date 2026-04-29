'use client';
import { useState, useEffect, useCallback } from 'react';
import { proveedoresClientService } from '../services/proveedores.client';
import type { Proveedor, CreateProveedorDto, UpdateProveedorDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Proveedor> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

export function useProveedores() {
  const [result, setResult] = useState<PaginatedResponse<Proveedor>>(EMPTY);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [search, setSearchState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedoresClientService.getAll({
        page,
        limit,
        search: search || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { load(); }, [load]);

  const setPage = useCallback((p: number) => {
    setPageState(p);
  }, []);

  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPageState(1);
  }, []);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPageState(1);
  }, []);

  const create = async (data: CreateProveedorDto): Promise<Proveedor> => {
    const created = await proveedoresClientService.create(data);
    await load();
    return created;
  };

  const update = async (id: string, data: UpdateProveedorDto): Promise<Proveedor> => {
    const updated = await proveedoresClientService.update(id, data);
    await load();
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await proveedoresClientService.delete(id);
    await load();
  };

  return {
    result,
    page,
    limit,
    search,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    refresh: load,
    create,
    update,
    remove,
  };
}
