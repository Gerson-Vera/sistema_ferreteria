'use client';
import { useState, useEffect, useCallback } from 'react';
import { cajasClientService } from '../services/cajas.client';
import type { Caja, CreateCajaDto, UpdateCajaDto } from '../types';

export function useCajas() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cajasClientService.getAll();
      setCajas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar cajas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateCajaDto): Promise<Caja> => {
    const created = await cajasClientService.create(data);
    setCajas(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, data: UpdateCajaDto): Promise<Caja> => {
    const updated = await cajasClientService.update(id, data);
    setCajas(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await cajasClientService.delete(id);
    setCajas(prev => prev.map(c => c.id === id ? { ...c, activo: false } : c));
  };

  return { cajas, loading, error, refresh: load, create, update, remove };
}
