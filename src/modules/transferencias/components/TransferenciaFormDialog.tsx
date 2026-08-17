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
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { productosClientService } from '@/modules/productos/services/productos.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import { stockAlmacenesClientService } from '@/modules/stock-almacenes/services/stock-almacenes.client';
import type { Producto } from '@/modules/productos/types';
import type { Almacen } from '@/modules/almacenes/types';
import type { CreateTransferenciaDto } from '../types';

type ItemDraft = {
  producto: Producto | null;
  cantidad: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransferenciaDto) => Promise<void>;
  loading: boolean;
};

const emptyItem = (): ItemDraft => ({ producto: null, cantidad: '' });

export default function TransferenciaFormDialog({ open, onClose, onSubmit, loading }: Props) {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stockOrigen, setStockOrigen] = useState<Record<string, number>>({});

  useEffect(() => {
    productosClientService.getAll({ activo: true, limit: 500 })
      .then(r => setProductos(r.data))
      .catch(() => {});
    almacenesClientService.getAll(true).then(setAlmacenes).catch(() => {});
  }, []);

  // Stock disponible (físico − reservado) por producto en el almacén de origen
  useEffect(() => {
    if (!origenId) { setStockOrigen({}); return; }
    stockAlmacenesClientService.getAll({ almacenId: origenId, limit: 1000 })
      .then(r => {
        const map: Record<string, number> = {};
        for (const s of r.data) map[s.productoId] = s.disponible;
        setStockOrigen(map);
      })
      .catch(() => setStockOrigen({}));
  }, [origenId]);

  const stockDe = (productoId: string) => stockOrigen[productoId] ?? 0;

  const handleClose = () => {
    setOrigenId('');
    setDestinoId('');
    setObservaciones('');
    setItems([emptyItem()]);
    setErrors({});
    onClose();
  };

  const setProductoItem = (idx: number, producto: Producto | null) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, producto } : it));
    setErrors(prev => ({ ...prev, [`pid_${idx}`]: '' }));
  };

  const setCantidad = (idx: number, value: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, cantidad: value } : it));
    setErrors(prev => ({ ...prev, [`cant_${idx}`]: '' }));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const selectedIds = new Set(items.map(it => it.producto?.id).filter(Boolean));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!origenId) errs.origen = 'Origen requerido';
    if (!destinoId) errs.destino = 'Destino requerido';
    if (origenId && destinoId && origenId === destinoId) errs.destino = 'Debe ser distinto al origen';
    items.forEach((it, i) => {
      if (!it.producto) errs[`pid_${i}`] = 'Selecciona un producto';
      const c = Number(it.cantidad);
      if (it.cantidad === '' || isNaN(c) || c <= 0) errs[`cant_${i}`] = 'Cantidad inválida';
      else if (it.producto && c > stockDe(it.producto.id)) {
        errs[`cant_${i}`] = `Máx. disponible: ${stockDe(it.producto.id)}`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      almacenOrigenId: origenId,
      almacenDestinoId: destinoId,
      observaciones: observaciones.trim() || undefined,
      items: items.map(it => ({
        productoId: it.producto!.id,
        cantidad: Number(it.cantidad),
      })),
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Nueva Transferencia entre Almacenes</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <FormControl size="small" fullWidth error={!!errors.origen}>
              <InputLabel>Almacén de origen</InputLabel>
              <Select
                value={origenId}
                label="Almacén de origen"
                onChange={e => setOrigenId(e.target.value)}
                disabled={loading}
              >
                {almacenes.map(a => (
                  <MenuItem key={a.id} value={a.id} disabled={a.id === destinoId}>{a.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <ArrowForwardIcon color="action" sx={{ display: { xs: 'none', sm: 'block' } }} />
            <FormControl size="small" fullWidth error={!!errors.destino}>
              <InputLabel>Almacén de destino</InputLabel>
              <Select
                value={destinoId}
                label="Almacén de destino"
                onChange={e => setDestinoId(e.target.value)}
                disabled={loading}
              >
                {almacenes.map(a => (
                  <MenuItem key={a.id} value={a.id} disabled={a.id === origenId}>{a.nombre}</MenuItem>
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
          <Typography variant="subtitle2">Productos a transferir</Typography>

          {items.map((item, idx) => (
            <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Autocomplete
                options={productos.filter(p => !selectedIds.has(p.id) || p.id === item.producto?.id)}
                getOptionLabel={p => `${p.nombre} (${p.sku})`}
                value={item.producto}
                onChange={(_, val) => setProductoItem(idx, val)}
                size="small"
                sx={{ flex: 2 }}
                disabled={!origenId || loading}
                renderOption={(props, p) => (
                  <Box component="li" {...props} key={p.id}>
                    <Box>
                      <Typography variant="body2">{p.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {p.sku} · Disponible en origen: {stockDe(p.id)}
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
                      (item.producto
                        ? `Disponible en origen: ${stockDe(item.producto.id)}`
                        : origenId ? 'Busca por nombre o SKU' : 'Selecciona primero el origen')
                    }
                  />
                )}
              />
              <TextField
                label="Cantidad"
                type="number"
                value={item.cantidad}
                onChange={e => setCantidad(idx, e.target.value)}
                error={!!errors[`cant_${idx}`]}
                helperText={errors[`cant_${idx}`] || ' '}
                size="small"
                sx={{ width: 140 }}
                slotProps={{ htmlInput: { min: 1 } }}
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
          {loading ? 'Guardando…' : 'Crear Transferencia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
