'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import { categoriasClientService } from '@/modules/categorias/services/categorias.client';
import type { Almacen } from '@/modules/almacenes/types';
import type { Categoria } from '@/modules/categorias/types';
import type { CreateConteoDto } from '../types';

type Props = {
  open: boolean;
  loading?: boolean;
  onSubmit: (data: CreateConteoDto) => void;
  onClose: () => void;
};

export default function ConteoFormDialog({ open, loading, onSubmit, onClose }: Props) {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [almacenId, setAlmacenId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (!open) return;
    almacenesClientService.getAll(true).then(a => {
      setAlmacenes(a);
      if (a.length > 0) setAlmacenId(prev => prev || a[0].id);
    }).catch(() => {});
    categoriasClientService.getAll().then(setCategorias).catch(() => {});
  }, [open]);

  const handleSubmit = () => {
    if (!almacenId) return;
    onSubmit({
      almacenId,
      categoriaId: categoriaId || undefined,
      observaciones: observaciones.trim() || undefined,
    });
  };

  const handleClose = () => {
    setCategoriaId('');
    setObservaciones('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nueva planilla de conteo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Se capturará el stock actual del sistema para compararlo con el conteo físico.
            Puedes limitar la planilla a una categoría (conteo cíclico).
          </Alert>
          <FormControl fullWidth size="small" required>
            <InputLabel>Almacén</InputLabel>
            <Select value={almacenId} label="Almacén" onChange={e => setAlmacenId(e.target.value)}>
              {almacenes.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Categoría (opcional)</InputLabel>
            <Select
              value={categoriaId}
              label="Categoría (opcional)"
              onChange={e => setCategoriaId(e.target.value)}
            >
              <MenuItem value="">Todas las categorías</MenuItem>
              {categorias.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Observaciones"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !almacenId}>
          {loading ? 'Generando…' : 'Generar planilla'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
