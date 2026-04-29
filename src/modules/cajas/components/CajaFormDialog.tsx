'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Caja } from '../types';

type FormData = { nombre: string; descripcion?: string };
type Errors = { nombre?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Caja | null;
  loading?: boolean;
};

export default function CajaFormDialog({ open, onClose, onSubmit, initialData, loading }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      setDescripcion(initialData?.descripcion ?? '');
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!nombre.trim()) next.nombre = 'El nombre es requerido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const data: FormData = { nombre: nombre.trim() };
    if (descripcion.trim()) data.descripcion = descripcion.trim();
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? 'Editar Caja' : 'Nueva Caja'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          label="Nombre"
          required
          fullWidth
          autoFocus
          value={nombre}
          onChange={e => { setNombre(e.target.value); setErrors(p => ({ ...p, nombre: undefined })); }}
          error={!!errors.nombre}
          helperText={errors.nombre}
          disabled={loading}
        />
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={2}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
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
