'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import TipoPagoFormDialog from '@/modules/tipos-pago/components/TipoPagoFormDialog';
import TiposPagoTable from '@/modules/tipos-pago/components/TiposPagoTable';
import { useTiposPago } from '@/modules/tipos-pago/hooks/useTiposPago';
import type { TipoPago } from '@/modules/tipos-pago/types';

export default function TiposPagoPage() {
  const { tiposPago, loading, error, create, update, remove } = useTiposPago();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TipoPago | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TipoPago | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (t: TipoPago) => { setEditTarget(t); setFormOpen(true); };

  const handleSubmit = async (data: { nombre: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Tipo de pago actualizado', 'success');
      } else {
        await create(data);
        showToast('Tipo de pago creado', 'success');
      }
      setFormOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      showToast('Tipo de pago eliminado', 'success');
      setDeleteTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tipos de Pago"
        subtitle="Métodos de pago aceptados"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo Tipo de Pago
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TiposPagoTable
        tiposPago={tiposPago}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      <TipoPagoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar tipo de pago"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
