'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import AjusteInventarioFormDialog from '@/modules/ajustes-inventario/components/AjusteInventarioFormDialog';
import AjustesInventarioTable from '@/modules/ajustes-inventario/components/AjustesInventarioTable';
import { useAjustesInventario } from '@/modules/ajustes-inventario/hooks/useAjustesInventario';
import type { AjusteInventario, CreateAjusteInventarioDto } from '@/modules/ajustes-inventario/types';

export default function AjustesInventarioPage() {
  const { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, create, aplicar, anular } = useAjustesInventario();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [aplicarTarget, setAplicarTarget] = useState<AjusteInventario | null>(null);
  const [anularTarget, setAnularTarget] = useState<AjusteInventario | null>(null);
  const [saving, setSaving] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (data: CreateAjusteInventarioDto) => {
    setSaving(true);
    try {
      await create(data);
      showToast('Ajuste de inventario creado', 'success');
      setFormOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAplicar = async () => {
    if (!aplicarTarget) return;
    setProcesando(true);
    try {
      await aplicar(aplicarTarget.id);
      showToast('Ajuste aplicado al inventario', 'success');
      setAplicarTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al aplicar', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const handleAnular = async () => {
    if (!anularTarget) return;
    setProcesando(true);
    try {
      await anular(anularTarget.id);
      showToast('Ajuste anulado', 'success');
      setAnularTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al anular', 'error');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ajustes de Inventario"
        subtitle="Conteo físico y corrección de stock"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Nuevo Ajuste
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AjustesInventarioTable
        ajustes={result.data}
        loading={loading}
        total={result.total}
        page={page}
        limit={limit}
        estadoFilter={filters.estado ?? ''}
        onEstadoChange={e => setFilters({ ...filters, estado: e || undefined })}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onAplicar={setAplicarTarget}
        onAnular={setAnularTarget}
      />

      <AjusteInventarioFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      />

      <ConfirmDialog
        open={!!aplicarTarget}
        title="Aplicar ajuste de inventario"
        message={`¿Confirmas aplicar el ajuste "${aplicarTarget?.numero}"? Esto actualizará el stock de los productos.`}
        onConfirm={handleAplicar}
        onClose={() => setAplicarTarget(null)}
        loading={procesando}
        confirmLabel="Aplicar"
        confirmColor="success"
      />

      <ConfirmDialog
        open={!!anularTarget}
        title="Anular ajuste"
        message={`¿Seguro que deseas anular el ajuste "${anularTarget?.numero}"? Esta acción no se puede deshacer.`}
        onConfirm={handleAnular}
        onClose={() => setAnularTarget(null)}
        loading={procesando}
        confirmLabel="Anular"
        confirmColor="error"
      />
    </>
  );
}
