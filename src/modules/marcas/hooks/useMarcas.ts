'use client';
import { useState, useEffect, useCallback } from 'react';
import { marcasClientService } from '../services/marcas.client';
import type { Marca, CreateMarcaDto, UpdateMarcaDto } from '../types';

export function useMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await marcasClientService.getAll();
      setMarcas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateMarcaDto): Promise<Marca> => {
    const created = await marcasClientService.create(data);
    setMarcas(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, data: UpdateMarcaDto): Promise<Marca> => {
    const updated = await marcasClientService.update(id, data);
    setMarcas(prev => prev.map(m => (m.id === id ? updated : m)));
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await marcasClientService.delete(id);
    setMarcas(prev => prev.map(m => m.id === id ? { ...m, activo: false } : m));
  };

  return { marcas, loading, error, refresh: load, create, update, remove };
}
