'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import ComprasTable from '@/modules/compras/components/ComprasTable';
import CompraRecibirDialog from '@/modules/compras/components/CompraRecibirDialog';
import { useCompras } from '@/modules/compras/hooks/useCompras';
import type { Compra } from '@/modules/compras/types';

export default function ComprasPage() {
  const router = useRouter();
  const { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, recibir, anular } = useCompras();
  const showToast = useToast();

  const [verTarget, setVerTarget] = useState<Compra | null>(null);
  const [recibirTarget, setRecibirTarget] = useState<Compra | null>(null);
  const [anularTarget, setAnularTarget] = useState<Compra | null>(null);
  const [procesando, setProcesando] = useState(false);

  const handleRecibir = async (compraId: string, itemsRecibidos: string[]) => {
    setProcesando(true);
    try {
      await recibir(compraId, itemsRecibidos);
      showToast(
        itemsRecibidos.length === recibirTarget?.items.length
          ? 'Compra marcada como recibida'
          : `Recepción parcial registrada (${itemsRecibidos.length} de ${recibirTarget?.items.length} productos)`,
        'success',
      );
      setRecibirTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al recibir compra', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const handleAnular = async () => {
    if (!anularTarget) return;
    setProcesando(true);
    try {
      await anular(anularTarget.id);
      showToast('Compra anulada', 'success');
      setAnularTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al anular compra', 'error');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Compras"
        subtitle="Órdenes de compra a proveedores"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/compras/nueva')}
          >
            Nueva Compra
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ComprasTable
        compras={result.data}
        loading={loading}
        total={result.total}
        page={page}
        limit={limit}
        estadoFilter={filters.estado ?? ''}
        onEstadoChange={e => setFilters({ ...filters, estado: e || undefined })}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onVer={setVerTarget}
        onRecibir={setRecibirTarget}
        onAnular={setAnularTarget}
      />

      {/* Modal: ver detalle (solo lectura) */}
      <CompraRecibirDialog
        open={!!verTarget}
        compra={verTarget}
        mode="ver"
        onClose={() => setVerTarget(null)}
      />

      {/* Modal: verificar y confirmar recepción con checklist */}
      <CompraRecibirDialog
        open={!!recibirTarget}
        compra={recibirTarget}
        mode="recibir"
        loading={procesando}
        onConfirm={handleRecibir}
        onClose={() => setRecibirTarget(null)}
      />

      <ConfirmDialog
        open={!!anularTarget}
        title="Anular compra"
        message={`¿Seguro que deseas anular la compra "${anularTarget?.numero}"? Esta acción no se puede deshacer.`}
        onConfirm={handleAnular}
        onClose={() => setAnularTarget(null)}
        loading={procesando}
        confirmLabel="Anular"
        confirmColor="error"
      />
    </>
  );
}
