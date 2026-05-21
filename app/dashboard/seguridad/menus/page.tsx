'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { useMenusAdmin } from '@/modules/seguridad/hooks/useMenusAdmin';
import MenusTree         from '@/modules/seguridad/components/MenusTree';
import MenuFormDialog    from '@/modules/seguridad/components/MenuFormDialog';
import type { MenuAdmin } from '@/modules/seguridad/types';

export default function MenusAdminPage() {
  const showToast = useToast();
  const { tree, flat, loading, error, crear, editar, toggle } = useMenusAdmin();

  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editTarget,  setEditTarget]  = useState<MenuAdmin | null>(null);
  const [padrePreset, setPadrePreset] = useState<string | undefined>();
  const [saving,      setSaving]      = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const openCrear = () => {
    setEditTarget(null);
    setPadrePreset(undefined);
    setDialogError(null);
    setDialogOpen(true);
  };

  const openAgregarHijo = (padre: MenuAdmin) => {
    setEditTarget(null);
    setPadrePreset(padre.id);
    setDialogError(null);
    setDialogOpen(true);
  };

  const openEditar = (m: MenuAdmin) => {
    setEditTarget(m);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleSave = async (data: Parameters<typeof crear>[0] | Parameters<typeof editar>[1]) => {
    setSaving(true);
    setDialogError(null);
    try {
      if (editTarget) {
        await editar(editTarget.id, data as Parameters<typeof editar>[1]);
        showToast('Menú actualizado', 'success');
      } else {
        const createData = { ...(data as Parameters<typeof crear>[0]) };
        if (padrePreset && !createData.menuPadreId) createData.menuPadreId = padrePreset;
        await crear(createData);
        showToast('Menú creado', 'success');
      }
      setDialogOpen(false);
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (m: MenuAdmin) => {
    try {
      await toggle(m.id);
      showToast(`Menú ${m.estado ? 'desactivado' : 'activado'}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Gestión de Menús"
        subtitle="Árbol de navegación — define la estructura y asígnala a roles"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCrear}>
            Nuevo menú raíz
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <MenusTree
        tree={tree}
        loading={loading}
        onEditar={openEditar}
        onToggle={handleToggle}
        onAgregarHijo={openAgregarHijo}
      />

      <MenuFormDialog
        open={dialogOpen}
        menu={editTarget}
        padres={flat.filter(m => !m.menuPadreId)}
        loading={saving}
        error={dialogError}
        onSave={handleSave as never}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
