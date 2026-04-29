'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import CajaFormDialog from '@/modules/cajas/components/CajaFormDialog';
import CajasTable from '@/modules/cajas/components/CajasTable';
import { useCajas } from '@/modules/cajas/hooks/useCajas';
import type { Caja } from '@/modules/cajas/types';

export default function CajasPage() {
  const { cajas, loading, error, create, update, remove } = useCajas();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Caja | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Caja | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (c: Caja) => { setEditTarget(c); setFormOpen(true); };

  const handleSubmit = async (data: { nombre: string; descripcion?: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Caja actualizada', 'success');
      } else {
        await create(data);
        showToast('Caja creada', 'success');
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
      showToast('Caja eliminada', 'success');
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
        title="Cajas"
        subtitle="Puntos de venta y cajas registradoras"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nueva Caja
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CajasTable
        cajas={cajas}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      <CajaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar caja"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
