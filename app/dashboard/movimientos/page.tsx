'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import PageHeader from '@/shared/components/ui/PageHeader';
import MovimientosTable from '@/modules/movimientos/components/MovimientosTable';
import { useMovimientos } from '@/modules/movimientos/hooks/useMovimientos';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import type { Almacen } from '@/modules/almacenes/types';

export default function MovimientosPage() {
  const { result, page, limit, filters, loading, error, setPage, setLimit, setFilters } = useMovimientos();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  useEffect(() => {
    almacenesClientService.getAll().then(setAlmacenes).catch(() => {});
  }, []);

  return (
    <>
      <PageHeader
        title="Movimientos de Inventario"
        subtitle="Kardex — historial de entradas y salidas"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <MovimientosTable
        movimientos={result.data}
        loading={loading}
        total={result.total}
        page={page}
        limit={limit}
        tipoFilter={filters.tipo ?? ''}
        almacenFilter={filters.almacenId ?? ''}
        almacenes={almacenes}
        onTipoChange={t => setFilters({ ...filters, tipo: t || undefined })}
        onAlmacenChange={a => setFilters({ ...filters, almacenId: a || undefined })}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </>
  );
}
