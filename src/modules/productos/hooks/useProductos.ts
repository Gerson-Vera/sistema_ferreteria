'use client';
import { useState, useEffect, useCallback } from 'react';
import { productosClientService } from '../services/productos.client';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types';
import type { PaginatedResponse } from '@/shared/types';

export type StatusFilter = 'all' | 'activo' | 'inactivo';

const EMPTY: PaginatedResponse<Producto> = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };

const toActivo = (s: StatusFilter): boolean | undefined =>
  s === 'all' ? undefined : s === 'activo';

export function useProductos() {
  const [result, setResult] = useState<PaginatedResponse<Producto>>(EMPTY);
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(10);
  const [search, setSearchState] = useState('');
  const [categoriaId, setCategoriaIdState] = useState('');
  const [almacenId, setAlmacenIdState] = useState('');
  const [status, setStatusState] = useState<StatusFilter>('activo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosClientService.getAll({
        page,
        limit,
        search: search || undefined,
        categoriaId: categoriaId || undefined,
        almacenId: almacenId || undefined,
        activo: toActivo(status),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoriaId, almacenId, status]);

  useEffect(() => { load(); }, [load]);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(1);
  }, []);

  const setCategoriaId = useCallback((id: string) => {
    setCategoriaIdState(id);
    setPage(1);
  }, []);

  const setAlmacenId = useCallback((id: string) => {
    setAlmacenIdState(id);
    setPage(1);
  }, []);

  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPage(1);
  }, []);

  const setStatus = useCallback((s: StatusFilter) => {
    setStatusState(s);
    setPage(1);
  }, []);

  const create = async (data: CreateProductoDto): Promise<Producto> => {
    const created = await productosClientService.create(data);
    await load();
    return created;
  };

  const update = async (id: string, data: UpdateProductoDto): Promise<Producto> => {
    const updated = await productosClientService.update(id, data);
    await load();
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await productosClientService.delete(id);
    await load();
  };

  return {
    productos: result.data,
    total: result.total,
    page,
    setPage,
    totalPages: result.totalPages,
    limit,
    setLimit,
    status,
    setStatus,
    search,
    setSearch,
    categoriaId,
    setCategoriaId,
    almacenId,
    setAlmacenId,
    loading,
    error,
    refresh: load,
    create,
    update,
    remove,
  };
}
