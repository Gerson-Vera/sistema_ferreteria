'use client';
import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { productosClientService } from '@/modules/productos/services/productos.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import { stockAlmacenesClientService } from '@/modules/stock-almacenes/services/stock-almacenes.client';
import type { Producto } from '@/modules/productos/types';
import type { Almacen } from '@/modules/almacenes/types';
import type { CreateAjusteInventarioDto } from '../types';

type ItemDraft = {
  producto: Producto | null;
  stockFisico: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAjusteInventarioDto) => Promise<void>;
  loading: boolean;
};

const emptyItem = (): ItemDraft => ({ producto: null, stockFisico: '' });

export default function AjusteInventarioFormDialog({ open, onClose, onSubmit, loading }: Props) {
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [almacenId, setAlmacenId] = useState('');
  const [stockAlmacen, setStockAlmacen] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoadingProductos(true);
    productosClientService.getAll({ activo: true, limit: 500 })
      .then(r => setProductos(r.data))
      .catch(() => {})
      .finally(() => setLoadingProductos(false));
    almacenesClientService.getAll(true).then(a => {
      setAlmacenes(a);
      if (a.length > 0) setAlmacenId(prev => prev || a[0].id);
    }).catch(() => {});
  }, []);

  // Stock actual por producto en el almacén seleccionado
  useEffect(() => {
    if (!almacenId) { setStockAlmacen({}); return; }
    stockAlmacenesClientService.getAll({ almacenId, limit: 1000 })
      .then(r => {
        const map: Record<string, number> = {};
        for (const s of r.data) map[s.productoId] = s.stock;
        setStockAlmacen(map);
      })
      .catch(() => setStockAlmacen({}));
  }, [almacenId]);

  const stockDe = (productoId: string) => stockAlmacen[productoId] ?? 0;

  const handleClose = () => {
    setMotivo('');
    setObservaciones('');
    setItems([emptyItem()]);
    setErrors({});
    onClose();
  };

  const setProductoItem = (idx: number, producto: Producto | null) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, producto } : it));
    setErrors(prev => ({ ...prev, [`pid_${idx}`]: '' }));
  };

  const setStockFisico = (idx: number, value: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, stockFisico: value } : it));
    setErrors(prev => ({ ...prev, [`sf_${idx}`]: '' }));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const selectedIds = new Set(items.map(it => it.producto?.id).filter(Boolean));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!motivo.trim()) errs.motivo = 'Motivo requerido';
    if (!almacenId) errs.almacenId = 'Almacén requerido';
    items.forEach((it, i) => {
      if (!it.producto) errs[`pid_${i}`] = 'Selecciona un producto';
      const sf = Number(it.stockFisico);
      if (it.stockFisico === '' || isNaN(sf) || sf < 0) errs[`sf_${i}`] = 'Valor inválido';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      motivo: motivo.trim(),
      almacenId,
      observaciones: observaciones.trim() || undefined,
      items: items.map(it => ({
        productoId: it.producto!.id,
        stockFisico: Number(it.stockFisico),
      })),
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Nuevo Ajuste de Inventario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Motivo"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              error={!!errors.motivo}
              helperText={errors.motivo}
              fullWidth
              size="small"
              disabled={loading}
            />
            <FormControl size="small" sx={{ minWidth: 200 }} error={!!errors.almacenId}>
              <InputLabel>Almacén</InputLabel>
              <Select
                value={almacenId}
                label="Almacén"
                onChange={e => setAlmacenId(e.target.value)}
                disabled={loading}
              >
                {almacenes.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
            disabled={loading}
          />

          <Divider />
          <Typography variant="subtitle2">Productos a ajustar</Typography>

          {items.map((item, idx) => (
            <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Autocomplete
                options={productos.filter(p => !selectedIds.has(p.id) || p.id === item.producto?.id)}
                getOptionLabel={p => `${p.nombre} (${p.sku})`}
                value={item.producto}
                onChange={(_, val) => setProductoItem(idx, val)}
                loading={loadingProductos}
                size="small"
                sx={{ flex: 2 }}
                renderOption={(props, p) => (
                  <Box component="li" {...props} key={p.id}>
                    <Box>
                      <Typography variant="body2">{p.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {p.sku} · Stock en almacén: {stockDe(p.id)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Producto"
                    error={!!errors[`pid_${idx}`]}
                    helperText={
                      errors[`pid_${idx}`] ||
                      (item.producto ? `Stock en almacén: ${stockDe(item.producto.id)}` : 'Busca por nombre o SKU')
                    }
                  />
                )}
              />
              <TextField
                label="Stock Físico"
                type="number"
                value={item.stockFisico}
                onChange={e => setStockFisico(idx, e.target.value)}
                error={!!errors[`sf_${idx}`]}
                helperText={errors[`sf_${idx}`] || ' '}
                size="small"
                sx={{ width: 140 }}
                slotProps={{ htmlInput: { min: 0 } }}
                disabled={loading}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1 || loading}
                sx={{ mt: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            disabled={loading}
          >
            Agregar producto
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar Ajuste'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
