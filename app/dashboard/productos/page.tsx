'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import BarcodeReaderIcon from '@mui/icons-material/BarcodeReader';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { useCategorias } from '@/modules/categorias/hooks/useCategorias';
import { useAlmacenes } from '@/modules/almacenes/hooks/useAlmacenes';
import ProductoFormDialog from '@/modules/productos/components/ProductoFormDialog';
import ProductoConversionesDialog from '@/modules/productos/components/ProductoConversionesDialog';
import EtiquetasBarcodeDialog from '@/modules/productos/components/EtiquetasBarcodeDialog';
import ProductosTable from '@/modules/productos/components/ProductosTable';
import { useProductos } from '@/modules/productos/hooks/useProductos';
import type { CreateProductoDto } from '@/modules/productos/types';
import type { Producto } from '@/modules/productos/types';

export default function ProductosPage() {
  const { categorias } = useCategorias();
  const { almacenes } = useAlmacenes();
  const {
    productos, total, page, setPage, limit, setLimit,
    search, setSearch, categoriaId, setCategoriaId,
    almacenId, setAlmacenId,
    status, setStatus,
    loading, error, create, update, remove, refresh,
  } = useProductos();
  const showToast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [conversionesTarget, setConversionesTarget] = useState<Producto | null>(null);
  const [barcodeTargets, setBarcodeTargets] = useState<Producto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const p of productos) {
        if (checked) next.add(p.id); else next.delete(p.id);
      }
      return next;
    });
  };

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
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<BarcodeReaderIcon />}
              disabled={selectedIds.size === 0}
              onClick={() => setBarcodeTargets(productos.filter(p => selectedIds.has(p.id)))}
            >
              Imprimir códigos ({selectedIds.size})
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Nuevo Producto
            </Button>
          </Stack>
        }
      />

      {error &&<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ProductosTable
        productos={productos}
        categorias={categorias}
        almacenes={almacenes}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        search={search}
        categoriaId={categoriaId}
        almacenId={almacenId}
        onSearchChange={setSearch}
        onCategoriaChange={setCategoriaId}
        onAlmacenChange={setAlmacenId}
        onPageChange={setPage}
        onLimitChange={setLimit}
        status={status}
        onStatusChange={setStatus}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
        onConversiones={setConversionesTarget}
        onPrintBarcode={p => setBarcodeTargets([p])}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
      />

      <ProductoConversionesDialog
        producto={conversionesTarget}
        onClose={() => setConversionesTarget(null)}
      />

      <EtiquetasBarcodeDialog
        productos={barcodeTargets}
        onClose={() => setBarcodeTargets([])}
        onGenerated={() => { setSelectedIds(new Set()); refresh(); }}
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
        message={`¿Seguro que deseas eliminar "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
