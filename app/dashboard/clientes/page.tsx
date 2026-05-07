'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import ClienteFormDialog from '@/modules/clientes/components/ClienteFormDialog';
import ClientesTable from '@/modules/clientes/components/ClientesTable';
import { useClientes } from '@/modules/clientes/hooks/useClientes';
import type { Cliente, CreateClienteDto } from '@/modules/clientes/types';

export default function ClientesPage() {
  const { result, page, limit, search, loading, error, setPage, setLimit, setSearch, create, update, remove } = useClientes();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (c: Cliente) => { setEditTarget(c); setFormOpen(true); };

  const handleSubmit = async (data: CreateClienteDto) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Cliente actualizado', 'success');
      } else {
        await create(data);
        showToast('Cliente creado', 'success');
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
      showToast('Cliente eliminado', 'success');
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
        title="Clientes"
        subtitle="Gestión de clientes"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo Cliente
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ClientesTable
        clientes={result.data}
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

      <ClienteFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar cliente"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
