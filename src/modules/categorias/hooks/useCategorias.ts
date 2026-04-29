'use client';
import { useState, useEffect, useCallback } from 'react';
import { categoriasClientService } from '../services/categorias.client';
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriasClientService.getAll();
      setCategorias(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateCategoriaDto): Promise<Categoria> => {
    const created = await categoriasClientService.create(data);
    setCategorias(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, data: UpdateCategoriaDto): Promise<Categoria> => {
    const updated = await categoriasClientService.update(id, data);
    setCategorias(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await categoriasClientService.delete(id);
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, activo: false } : c));
  };

  return { categorias, loading, error, refresh: load, create, update, remove };
}
