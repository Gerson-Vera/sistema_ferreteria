'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import UnidadMedidaFormDialog from '@/modules/unidades-medida/components/UnidadMedidaFormDialog';
import UnidadesMedidaTable from '@/modules/unidades-medida/components/UnidadesMedidaTable';
import { useUnidadesMedida } from '@/modules/unidades-medida/hooks/useUnidadesMedida';
import type { UnidadMedida } from '@/modules/unidades-medida/types';

export default function UnidadesMedidaPage() {
  const { unidades, loading, error, create, update, remove } = useUnidadesMedida();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UnidadMedida | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnidadMedida | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (u: UnidadMedida) => { setEditTarget(u); setFormOpen(true); };

  const handleSubmit = async (data: { codigo: string; nombre: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Unidad de medida actualizada', 'success');
      } else {
        await create(data);
        showToast('Unidad de medida creada', 'success');
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
      showToast('Unidad de medida eliminada', 'success');
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
        title="Unidades de Medida"
        subtitle="Unidades utilizadas en productos"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nueva Unidad
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <UnidadesMedidaTable
        unidades={unidades}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      <UnidadMedidaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar unidad de medida"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre} (${deleteTarget?.codigo})"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
