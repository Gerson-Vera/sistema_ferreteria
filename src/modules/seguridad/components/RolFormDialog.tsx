'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { RolAdmin } from '../types';

type Props = {
  open: boolean;
  rol: RolAdmin | null;
  loading: boolean;
  error: string | null;
  onSave: (data: { codigo?: string; descripcion: string }) => void;
  onClose: () => void;
};

export default function RolFormDialog({ open, rol, loading, error, onSave, onClose }: Props) {
  const isEdit = !!rol;
  const [codigo,      setCodigo]      = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (open) {
      setCodigo(rol?.codigo ?? '');
      setDescripcion(rol?.descripcion ?? '');
    }
  }, [open, rol]);

  const handleSave = () => {
    const data: Parameters<typeof onSave>[0] = { descripcion };
    if (!isEdit) data.codigo = codigo.toUpperCase();
    onSave(data);
  };

  const canSave = descripcion.trim() && (!isEdit ? codigo.trim() : true);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Editar rol — ${rol?.codigo}` : 'Nuevo rol'}</DialogTitle>
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
              helperText="Ejemplo: VENDEDOR, ALMACEN, CAJERO — en mayúsculas"
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
            />
          )}
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            size="small"
            required
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || !canSave}>
          {loading ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear rol'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
