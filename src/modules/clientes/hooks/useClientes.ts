'use client';
import { useState, useEffect, useCallback } from 'react';
import { clientesClientService } from '../services/clientes.client';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Cliente> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

export function useClientes() {
  const [result, setResult] = useState<PaginatedResponse<Cliente>>(EMPTY);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [search, setSearchState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientesClientService.getAll({ page, limit, search: search || undefined });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { load(); }, [load]);

  const setPage = useCallback((p: number) => { setPageState(p); }, []);
  const setLimit = useCallback((l: number) => { setLimitState(l); setPageState(1); }, []);
  const setSearch = useCallback((s: string) => { setSearchState(s); setPageState(1); }, []);

  const create = async (data: CreateClienteDto): Promise<Cliente> => {
    const created = await clientesClientService.create(data);
    await load();
    return created;
  };

  const update = async (id: string, data: UpdateClienteDto): Promise<Cliente> => {
    const updated = await clientesClientService.update(id, data);
    await load();
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await clientesClientService.delete(id);
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
