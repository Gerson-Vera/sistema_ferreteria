'use client';
import { useState, useEffect, useCallback } from 'react';
import { unidadesMedidaClientService } from '../services/unidades-medida.client';
import type { UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../types';

export function useUnidadesMedida() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await unidadesMedidaClientService.getAll();
      setUnidades(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar unidades de medida');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateUnidadMedidaDto): Promise<UnidadMedida> => {
    const created = await unidadesMedidaClientService.create(data);
    setUnidades(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, data: UpdateUnidadMedidaDto): Promise<UnidadMedida> => {
    const updated = await unidadesMedidaClientService.update(id, data);
    setUnidades(prev => prev.map(u => (u.id === id ? updated : u)));
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await unidadesMedidaClientService.delete(id);
    setUnidades(prev => prev.map(u => u.id === id ? { ...u, activo: false } : u));
  };

  return { unidades, loading, error, refresh: load, create, update, remove };
}
