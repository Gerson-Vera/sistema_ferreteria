'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import type { Categoria } from '@/modules/categorias/types';
import type { Producto, CreateProductoDto } from '../types';

type FormErrors = Partial<Record<keyof FormState, string>>;

type FormState = {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  precioCompra: string;
  precioVenta: string;
  stock: string;
  stockMinimo: string;
};

const emptyForm: FormState = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
  precioCompra: '',
  precioVenta: '',
  stock: '0',
  stockMinimo: '0',
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductoDto) => Promise<void>;
  initialData?: Producto | null;
  categorias: Categoria[];
  loading?: boolean;
};

export default function ProductoFormDialog({ open, onClose, onSubmit, initialData, categorias, loading }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              nombre: initialData.nombre,
              descripcion: initialData.descripcion ?? '',
              categoriaId: initialData.categoriaId,
              precioCompra: String(initialData.precioCompra),
              precioVenta: String(initialData.precioVenta),
              stock: String(initialData.stock),
              stockMinimo: String(initialData.stockMinimo),
            }
          : emptyForm,
      );
      setErrors({});
    }
  }, [open, initialData]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.categoriaId) e.categoriaId = 'Selecciona una categoría';
    const pc = parseFloat(form.precioCompra);
    if (isNaN(pc) || pc <= 0) e.precioCompra = 'Debe ser mayor a 0';
    const pv = parseFloat(form.precioVenta);
    if (isNaN(pv) || pv <= 0) e.precioVenta = 'Debe ser mayor a 0';
    const st = parseInt(form.stock, 10);
    if (isNaN(st) || st < 0) e.stock = 'Debe ser ≥ 0';
    const sm = parseInt(form.stockMinimo, 10);
    if (isNaN(sm) || sm < 0) e.stockMinimo = 'Debe ser ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      categoriaId: form.categoriaId,
      precioCompra: parseFloat(form.precioCompra),
      precioVenta: parseFloat(form.precioVenta),
      stock: parseInt(form.stock, 10),
      stockMinimo: parseInt(form.stockMinimo, 10),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Nombre"
              required
              fullWidth
              autoFocus
              value={form.nombre}
              onChange={set('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth required error={!!errors.categoriaId} disabled={loading}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={form.categoriaId}
                label="Categoría"
                onChange={e => {
                  setForm(prev => ({ ...prev, categoriaId: e.target.value }));
                  setErrors(prev => ({ ...prev, categoriaId: undefined }));
                }}
              >
                {categorias.filter(c => c.activo).map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoriaId && <FormHelperText>{errors.categoriaId}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={form.descripcion}
              onChange={set('descripcion')}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Precio Compra (S/)"
              required
              fullWidth
              type="number"
              value={form.precioCompra}
              onChange={set('precioCompra')}
              error={!!errors.precioCompra}
              helperText={errors.precioCompra}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Precio Venta (S/)"
              required
              fullWidth
              type="number"
              value={form.precioVenta}
              onChange={set('precioVenta')}
              error={!!errors.precioVenta}
              helperText={errors.precioVenta}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Stock Inicial"
              required
              fullWidth
              type="number"
              value={form.stock}
              onChange={set('stock')}
              error={!!errors.stock}
              helperText={errors.stock}
              disabled={loading || !!initialData}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Stock Mínimo"
              required
              fullWidth
              type="number"
              value={form.stockMinimo}
              onChange={set('stockMinimo')}
              error={!!errors.stockMinimo}
              helperText={errors.stockMinimo}
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
