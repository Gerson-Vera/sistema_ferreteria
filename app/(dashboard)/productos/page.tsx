'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { useCategorias } from '@/modules/categorias/hooks/useCategorias';
import ProductoFormDialog from '@/modules/productos/components/ProductoFormDialog';
import ProductosTable from '@/modules/productos/components/ProductosTable';
import { useProductos } from '@/modules/productos/hooks/useProductos';
import type { CreateProductoDto } from '@/modules/productos/types';
import type { Producto } from '@/modules/productos/types';

export default function ProductosPage() {
  const { categorias } = useCategorias();
  const {
    productos, total, page, setPage, limit, setLimit,
    search, setSearch, categoriaId, setCategoriaId,
    status, setStatus,
    loading, error, create, update, remove,
  } = useProductos();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleOpenEdit = (prod: Producto) => { setEditTarget(prod); setFormOpen(true); };

  const handleSubmit = async (data: CreateProductoDto) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, data);
        showToast('Producto actualizado', 'success');
      } else {
        await create(data);
        showToast('Producto creado', 'success');
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
      showToast('Producto eliminado', 'success');
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
        title="Productos"
        subtitle="Gestión de inventario"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo Producto
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ProductosTable
        productos={productos}
        categorias={categorias}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        search={search}
        categoriaId={categoriaId}
        onSearchChange={setSearch}
        onCategoriaChange={setCategoriaId}
        onPageChange={setPage}
        onLimitChange={setLimit}
        status={status}
        onStatusChange={setStatus}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      <ProductoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editTarget}
        categorias={categorias}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}" (${deleteTarget?.sku})? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />

    </>
  );
}
