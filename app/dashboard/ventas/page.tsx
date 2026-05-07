'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import VentasTable from '@/modules/ventas/components/VentasTable';
import { useVentas } from '@/modules/ventas/hooks/useVentas';
import type { Venta } from '@/modules/ventas/types';

export default function VentasPage() {
  const router = useRouter();
  const { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, anular } = useVentas();
  const showToast = useToast();

  const [anularTarget, setAnularTarget] = useState<Venta | null>(null);
  const [anulando, setAnulando] = useState(false);

  const handleAnular = async () => {
    if (!anularTarget) return;
    setAnulando(true);
    try {
      await anular(anularTarget.id);
      showToast('Venta anulada', 'success');
      setAnularTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al anular venta', 'error');
    } finally {
      setAnulando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ventas"
        subtitle="Registro y seguimiento de ventas"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/ventas/nueva')}
          >
            Nueva Venta
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <VentasTable
        ventas={result.data}
        loading={loading}
        total={result.total}
        page={page}
        limit={limit}
        estadoFilter={filters.estado ?? ''}
        onEstadoChange={e => setFilters({ ...filters, estado: e || undefined })}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onAnular={setAnularTarget}
      />

      <ConfirmDialog
        open={!!anularTarget}
        title="Anular venta"
        message={`¿Seguro que deseas anular la venta "${anularTarget?.numero}"? Esta acción no se puede deshacer.`}
        onConfirm={handleAnular}
        onClose={() => setAnularTarget(null)}
        loading={anulando}
        confirmLabel="Anular"
        confirmColor="error"
      />
    </>
  );
}
