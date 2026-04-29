'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import AlmacenFormDialog from '@/modules/almacenes/components/AlmacenFormDialog';
import AlmacenesTable from '@/modules/almacenes/components/AlmacenesTable';
import { useAlmacenes } from '@/modules/almacenes/hooks/useAlmacenes';
import type { Almacen } from '@/modules/almacenes/types';

export default function AlmacenesPage() {
  const { almacenes, loading, error, create, update, remove } = useAlmacenes();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Almacen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Almacen | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (a: Almacen) => { setEditTarget(a); setFormOpen(true); };

  const handleSubmit = async (data: { nombre: string; descripcion?: string; direccion?: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Almacén actualizado', 'success');
      } else {
        await create(data);
        showToast('Almacén creado', 'success');
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
      showToast('Almacén eliminado', 'success');
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
        title="Almacenes"
        subtitle="Gestión de almacenes y bodegas"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo Almacén
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AlmacenesTable
        almacenes={almacenes}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      <AlmacenFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar almacén"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
