'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import type { Proveedor, CreateProveedorDto } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProveedorDto) => Promise<void>;
  initialData?: Proveedor | null;
  loading?: boolean;
};

export default function ProveedorFormDialog({ open, onClose, onSubmit, initialData, loading }: Props) {
  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      setRuc(initialData?.ruc ?? '');
      setContacto(initialData?.contacto ?? '');
      setTelefono(initialData?.telefono ?? '');
      setEmail(initialData?.email ?? '');
      setDireccion(initialData?.direccion ?? '');
      setErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    const newErrors: { nombre?: string } = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    await onSubmit({
      nombre: nombre.trim(),
      ruc: ruc.trim() || undefined,
      contacto: contacto.trim() || undefined,
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Grid container spacing={2}>
          {/* Row 1: Nombre | RUC */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Nombre"
              required
              fullWidth
              autoFocus
              value={nombre}
              onChange={e => { setNombre(e.target.value); setErrors(prev => ({ ...prev, nombre: undefined })); }}
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="RUC"
              fullWidth
              value={ruc}
              onChange={e => setRuc(e.target.value)}
              helperText="11 dígitos"
              disabled={loading}
              slotProps={{ htmlInput: { maxLength: 11 } }}
            />
          </Grid>

          {/* Row 2: Contacto | Teléfono */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Contacto"
              fullWidth
              value={contacto}
              onChange={e => setContacto(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Teléfono"
              fullWidth
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* Row 3: Email | Dirección */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Dirección"
              fullWidth
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
