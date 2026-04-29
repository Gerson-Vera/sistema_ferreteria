'use client';
import { useState, useEffect, useCallback } from 'react';
import { tiposPagoClientService } from '../services/tipos-pago.client';
import type { TipoPago, CreateTipoPagoDto, UpdateTipoPagoDto } from '../types';

export function useTiposPago() {
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tiposPagoClientService.getAll();
      setTiposPago(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar tipos de pago');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateTipoPagoDto): Promise<TipoPago> => {
    const created = await tiposPagoClientService.create(data);
    setTiposPago(prev => [...prev, created]);
    return created;
  };

  const update = async (id: string, data: UpdateTipoPagoDto): Promise<TipoPago> => {
    const updated = await tiposPagoClientService.update(id, data);
    setTiposPago(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  };

  const remove = async (id: string): Promise<void> => {
    await tiposPagoClientService.delete(id);
    setTiposPago(prev => prev.map(t => t.id === id ? { ...t, activo: false } : t));
  };

  return { tiposPago, loading, error, refresh: load, create, update, remove };
}
