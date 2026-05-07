'use client';
import Alert from '@mui/material/Alert';
import PageHeader from '@/shared/components/ui/PageHeader';
import MovimientosTable from '@/modules/movimientos/components/MovimientosTable';
import { useMovimientos } from '@/modules/movimientos/hooks/useMovimientos';

export default function MovimientosPage() {
  const { result, page, limit, filters, loading, error, setPage, setLimit, setFilters } = useMovimientos();

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
        onTipoChange={t => setFilters({ ...filters, tipo: t || undefined })}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </>
  );
}
