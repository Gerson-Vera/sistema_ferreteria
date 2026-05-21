'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { MenuAdmin } from '../types';

type Props = {
  open: boolean;
  menu: MenuAdmin | null;
  padres: MenuAdmin[];
  loading: boolean;
  error: string | null;
  onSave: (data: {
    codigo?: string; descripcion: string;
    url?: string; icono?: string; orden?: number; menuPadreId?: string | null;
  }) => void;
  onClose: () => void;
};

export default function MenuFormDialog({ open, menu, padres, loading, error, onSave, onClose }: Props) {
  const isEdit = !!menu;
  const [codigo,       setCodigo]       = useState('');
  const [descripcion,  setDescripcion]  = useState('');
  const [url,          setUrl]          = useState('');
  const [icono,        setIcono]        = useState('');
  const [orden,        setOrden]        = useState(0);
  const [menuPadreId,  setMenuPadreId]  = useState<string>('');

  useEffect(() => {
    if (open) {
      setCodigo(menu?.codigo ?? '');
      setDescripcion(menu?.descripcion ?? '');
      setUrl(menu?.url ?? '');
      setIcono(menu?.icono ?? '');
      setOrden(menu?.orden ?? 0);
      setMenuPadreId(menu?.menuPadreId ?? '');
    }
  }, [open, menu]);

  const handleSave = () => {
    const data: Parameters<typeof onSave>[0] = {
      descripcion,
      url: url.trim() || undefined,
      icono: icono.trim() || undefined,
      orden,
      menuPadreId: menuPadreId || null,
    };
    if (!isEdit) data.codigo = codigo.toUpperCase();
    onSave(data);
  };

  const padresFiltrados = padres.filter(p => !menu || p.id !== menu.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Editar menú — ${menu?.codigo}` : 'Nuevo menú'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {!isEdit && (
            <TextField
              label="Código"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              size="small"
              required
              helperText="Identificador único. Ej: PRODUCTOS, VENTAS_RPT"
            />
          )}
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            size="small"
            required
          />
          <TextField
            label="URL (opcional)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            size="small"
            helperText="Ej: /dashboard/productos"
          />
          <TextField
            label="Ícono MUI (opcional)"
            value={icono}
            onChange={e => setIcono(e.target.value)}
            size="small"
            helperText="Ej: Inventory2Icon"
          />
          <TextField
            label="Orden"
            type="number"
            value={orden}
            onChange={e => setOrden(parseInt(e.target.value) || 0)}
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            select
            label="Menú padre (opcional)"
            value={menuPadreId}
            onChange={e => setMenuPadreId(e.target.value)}
            size="small"
          >
            <MenuItem value="">— Sin padre (menú raíz) —</MenuItem>
            {padresFiltrados.filter(p => !p.menuPadreId).map(p => (
              <MenuItem key={p.id} value={p.id}>{p.descripcion} ({p.codigo})</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !descripcion.trim() || (!isEdit && !codigo.trim())}
        >
          {loading ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear menú'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
