'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type { UnidadMedida } from '../types';

type FormData = { codigo: string; nombre: string };
type Errors = Partial<FormData>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: UnidadMedida | null;
  loading?: boolean;
};

export default function UnidadMedidaFormDialog({ open, onClose, onSubmit, initialData, loading }: Props) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setCodigo(initialData?.codigo ?? '');
      setNombre(initialData?.nombre ?? '');
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!codigo.trim()) next.codigo = 'El código es requerido';
    if (!nombre.trim()) next.nombre = 'El nombre es requerido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({ codigo: codigo.trim().toUpperCase(), nombre: nombre.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {initialData ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          label="Código"
          required
          fullWidth
          autoFocus
          value={codigo}
          onChange={e => { setCodigo(e.target.value.toUpperCase()); setErrors(p => ({ ...p, codigo: undefined })); }}
          error={!!errors.codigo}
          helperText={errors.codigo ?? 'Ej: UND, KG, MT, LT'}
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: 10 } }}
        />
        <TextField
          label="Nombre"
          required
          fullWidth
          value={nombre}
          onChange={e => { setNombre(e.target.value); setErrors(p => ({ ...p, nombre: undefined })); }}
          error={!!errors.nombre}
          helperText={errors.nombre ?? 'Ej: Unidad, Kilogramo, Metro'}
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: 100 } }}
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
