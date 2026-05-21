'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { useRolesAdmin }  from '@/modules/seguridad/hooks/useRolesAdmin';
import { useMenusAdmin }  from '@/modules/seguridad/hooks/useMenusAdmin';
import RolesTable         from '@/modules/seguridad/components/RolesTable';
import RolFormDialog      from '@/modules/seguridad/components/RolFormDialog';
import RolPermisosDialog  from '@/modules/seguridad/components/RolPermisosDialog';
import type { RolAdmin } from '@/modules/seguridad/types';

export default function RolesAdminPage() {
  const showToast = useToast();
  const { roles, loading, error, crear, editar, toggle, asignarMenus } = useRolesAdmin();
  const { tree: menus } = useMenusAdmin();

  const [formOpen,      setFormOpen]      = useState(false);
  const [permisosOpen,  setPermisosOpen]  = useState(false);
  const [editTarget,    setEditTarget]    = useState<RolAdmin | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);

  const openCrear   = () => { setEditTarget(null); setFormError(null); setFormOpen(true); };
  const openEditar  = (r: RolAdmin) => { setEditTarget(r); setFormError(null); setFormOpen(true); };
  const openPermisos = (r: RolAdmin) => { setEditTarget(r); setFormError(null); setPermisosOpen(true); };

  const handleSaveForm = async (data: { codigo?: string; descripcion: string }) => {
    setSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await editar(editTarget.id, { descripcion: data.descripcion });
        showToast('Rol actualizado', 'success');
      } else {
        await crear({ codigo: data.codigo!, descripcion: data.descripcion });
        showToast('Rol creado', 'success');
      }
      setFormOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermisos = async (rolId: string, menuIds: string[]) => {
    setSaving(true);
    setFormError(null);
    try {
      await asignarMenus(rolId, menuIds);
      showToast('Permisos actualizados', 'success');
      setPermisosOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: RolAdmin) => {
    try {
      await toggle(r.id);
      showToast(`Rol ${r.estado ? 'desactivado' : 'activado'}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Gestión de Roles"
        subtitle="Define roles y sus permisos de acceso al menú"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCrear}>
            Nuevo Rol
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <RolesTable
        roles={roles}
        loading={loading}
        onEditar={openEditar}
        onPermisos={openPermisos}
        onToggle={handleToggle}
      />

      <RolFormDialog
        open={formOpen}
        rol={editTarget}
        loading={saving}
        error={formError}
        onSave={handleSaveForm}
        onClose={() => setFormOpen(false)}
      />

      <RolPermisosDialog
        open={permisosOpen}
        rol={editTarget}
        menus={menus}
        loading={saving}
        error={formError}
        onSave={handleSavePermisos}
        onClose={() => setPermisosOpen(false)}
      />
    </>
  );
}
