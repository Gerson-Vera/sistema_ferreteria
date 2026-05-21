'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { useUsuariosAdmin } from '@/modules/seguridad/hooks/useUsuariosAdmin';
import { useRolesAdmin }    from '@/modules/seguridad/hooks/useRolesAdmin';
import UsuariosTable        from '@/modules/seguridad/components/UsuariosTable';
import UsuarioFormDialog    from '@/modules/seguridad/components/UsuarioFormDialog';
import type { UsuarioAdmin } from '@/modules/seguridad/types';

export default function UsuariosAdminPage() {
  const { data: session } = useSession();
  const showToast = useToast();
  const { result, page, limit, filters, loading, error, setPage, setLimit, setFilters, refresh, crear, editar, toggle } = useUsuariosAdmin();
  const { roles } = useRolesAdmin();

  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState<UsuarioAdmin | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [dialogError,   setDialogError]   = useState<string | null>(null);

  const openCrear = () => { setEditTarget(null); setDialogError(null); setDialogOpen(true); };
  const openEditar = (u: UsuarioAdmin) => { setEditTarget(u); setDialogError(null); setDialogOpen(true); };

  const handleSave = async (data: Parameters<typeof crear>[0] | Parameters<typeof editar>[1]) => {
    setSaving(true);
    setDialogError(null);
    try {
      if (editTarget) {
        await editar(editTarget.id, data as Parameters<typeof editar>[1]);
        showToast('Usuario actualizado', 'success');
      } else {
        await crear(data as Parameters<typeof crear>[0]);
        showToast('Usuario creado', 'success');
      }
      setDialogOpen(false);
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u: UsuarioAdmin) => {
    try {
      await toggle(u.id);
      showToast(`Usuario ${u.estado ? 'desactivado' : 'activado'}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra cuentas, contraseñas y roles"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCrear}>
            Nuevo Usuario
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <UsuariosTable
        usuarios={result.data}
        loading={loading}
        total={result.total}
        page={page}
        limit={limit}
        search={filters.search ?? ''}
        estadoFilter={filters.estado ?? 'todos'}
        currentUserId={session?.user?.id}
        onSearchChange={v => setFilters({ ...filters, search: v || undefined })}
        onEstadoChange={v => setFilters({ ...filters, estado: v })}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEditar={openEditar}
        onToggle={handleToggle}
      />

      <UsuarioFormDialog
        open={dialogOpen}
        usuario={editTarget}
        roles={roles}
        loading={saving}
        error={dialogError}
        onSave={handleSave as never}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
