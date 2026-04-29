'use client';
import { useState, useEffect, useCallback } from 'react';
import { almacenesClientService } from '../services/almacenes.client';
import type { Almacen, CreateAlmacenDto, UpdateAlmacenDto } from '../types';

export function useAlmacenes() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await almacenesClientService.getAll();
      setAlmacenes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar almacenes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateAlmacenDto): Promise<Almacen> => {
    const created = await almacenesClientService.create(data);
    setAlmacenes(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, data: UpdateAlmacenDto): Promise<Almacen> => {
    const updated = await almacenesClientService.update(id, data);
    setAlmacenes(prev => prev.map(a => (a.id === id ? updated : a)));
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await almacenesClientService.delete(id);
    setAlmacenes(prev => prev.map(a => a.id === id ? { ...a, activo: false } : a));
  };

  return { almacenes, loading, error, refresh: load, create, update, remove };
}
