'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { Categoria } from '../types';

type FormData = { nombre: string; descripcion?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Categoria | null;
  loading?: boolean;
};

export default function CategoriaFormDialog({ open, onClose, onSubmit, initialData, loading }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre ?? '');
      setDescripcion(initialData?.descripcion ?? '');
      setError('');
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    await onSubmit({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          label="Nombre"
          required
          fullWidth
          autoFocus
          value={nombre}
          onChange={e => { setNombre(e.target.value); setError(''); }}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          disabled={loading}
        />
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
