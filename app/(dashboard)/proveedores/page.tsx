'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import ProveedorFormDialog from '@/modules/proveedores/components/ProveedorFormDialog';
import ProveedoresTable from '@/modules/proveedores/components/ProveedoresTable';
import { useProveedores } from '@/modules/proveedores/hooks/useProveedores';
import type { Proveedor } from '@/modules/proveedores/types';
import type { CreateProveedorDto } from '@/modules/proveedores/types';

export default function ProveedoresPage() {
  const { result, page, limit, search, loading, error, setPage, setLimit, setSearch, create, update, remove } = useProveedores();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Proveedor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Proveedor | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (p: Proveedor) => { setEditTarget(p); setFormOpen(true); };

  const handleSubmit = async (data: CreateProveedorDto) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Proveedor actualizado', 'success');
      } else {
        await create(data);
        showToast('Proveedor creado', 'success');
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
      showToast('Proveedor eliminado', 'success');
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
        title="Proveedores"
        subtitle="Gestión de proveedores"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo Proveedor
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ProveedoresTable
        proveedores={result.data}
        loading={loading}
        total={result.total}
        page={page}
        limit={limit}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      <ProveedorFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar proveedor"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
