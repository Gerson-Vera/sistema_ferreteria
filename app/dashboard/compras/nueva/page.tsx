'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { proveedoresClientService } from '@/modules/proveedores/services/proveedores.client';
import { productosClientService } from '@/modules/productos/services/productos.client';
import { comprasClientService } from '@/modules/compras/services/compras.client';
import type { Proveedor } from '@/modules/proveedores/types';
import type { Producto } from '@/modules/productos/types';

type LineItem = {
  producto: Producto;
  cantidad: number;
  costoUnitario: number;
};

const IGV_RATE = 0.18;
const fmt = (n: number) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

export default function NuevaCompraPage() {
  const router = useRouter();
  const showToast = useToast();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    proveedoresClientService.getAll({ limit: 200 }).then(r => setProveedores(r.data)).catch(() => {});
    productosClientService.getAll({ limit: 500, activo: true }).then(r => setProductos(r.data)).catch(() => {});
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0), [items]);
  const igv = useMemo(() => Math.round(subtotal * IGV_RATE * 100) / 100, [subtotal]);
  const total = useMemo(() => Math.round((subtotal + igv) * 100) / 100, [subtotal, igv]);

  const addProducto = () => {
    if (!productoSeleccionado) return;
    const existe = items.find(i => i.producto.id === productoSeleccionado.id);
    if (existe) {
      setItems(prev => prev.map(i =>
        i.producto.id === productoSeleccionado.id ? { ...i, cantidad: i.cantidad + 1 } : i,
      ));
    } else {
      setItems(prev => [...prev, {
        producto: productoSeleccionado,
        cantidad: 1,
        costoUnitario: productoSeleccionado.precioCompra,
      }]);
    }
    setProductoSeleccionado(null);
  };

  const updateCantidad = (idx: number, val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setItems(prev => prev.map((it, i) => i === idx ? { ...it, cantidad: n } : it));
  };

  const updateCosto = (idx: number, val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setItems(prev => prev.map((it, i) => i === idx ? { ...it, costoUnitario: n } : it));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError(null);
    if (!proveedorSeleccionado) { setError('Selecciona un proveedor'); return; }
    if (items.length === 0) { setError('Agrega al menos un producto'); return; }
    setSaving(true);
    try {
      await comprasClientService.create({
        proveedorId: proveedorSeleccionado.id,
        items: items.map(i => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          costoUnitario: i.costoUnitario,
        })),
        numeroFactura: numeroFactura.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      });
      showToast('Orden de compra registrada', 'success');
      router.push('/dashboard/compras');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrar compra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Nueva Compra"
        subtitle="Registrar una orden de compra"
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/compras')}>
            Volver
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Proveedor</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Autocomplete
              options={proveedores}
              getOptionLabel={p => p.ruc ? `${p.nombre} — ${p.ruc}` : p.nombre}
              value={proveedorSeleccionado}
              onChange={(_, val) => setProveedorSeleccionado(val)}
              renderInput={params => <TextField {...params} label="Seleccionar proveedor" size="small" />}
              sx={{ flex: 1, maxWidth: 480 }}
            />
            <TextField
              label="N° Factura (opcional)"
              value={numeroFactura}
              onChange={e => setNumeroFactura(e.target.value)}
              size="small"
              sx={{ maxWidth: 200 }}
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Productos</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Autocomplete
              options={productos}
              getOptionLabel={p => `${p.sku} — ${p.nombre} (costo: S/ ${p.precioCompra.toFixed(2)})`}
              value={productoSeleccionado}
              onChange={(_, val) => setProductoSeleccionado(val)}
              renderInput={params => <TextField {...params} label="Buscar producto" size="small" />}
              sx={{ flex: 1, maxWidth: 480 }}
            />
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addProducto} disabled={!productoSeleccionado}>
              Agregar
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>Cantidad</TableCell>
                  <TableCell align="right" sx={{ width: 130 }}>Costo Unit.</TableCell>
                  <TableCell align="right" sx={{ width: 120 }}>Subtotal</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sin productos agregados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <TableRow key={item.producto.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.producto.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.producto.sku}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.cantidad}
                          onChange={e => updateCantidad(idx, e.target.value)}
                          size="small"
                          sx={{ width: 80 }}
                          slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.costoUnitario}
                          onChange={e => updateCosto(idx, e.target.value)}
                          size="small"
                          sx={{ width: 110 }}
                          slotProps={{ htmlInput: { min: 0.01, step: 0.01, style: { textAlign: 'right' } } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {fmt(item.cantidad * item.costoUnitario)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            multiline
            rows={3}
            sx={{ flex: 1 }}
            size="small"
          />
          <Paper variant="outlined" sx={{ p: 2, minWidth: 240 }}>
            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{fmt(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">IGV (18%)</Typography>
                <Typography variant="body2">{fmt(igv)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Total</Typography>
                <Typography variant="subtitle2" color="primary">{fmt(total)}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => router.push('/dashboard/compras')} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving || items.length === 0}>
            {saving ? 'Guardando...' : 'Registrar Compra'}
          </Button>
        </Box>
      </Stack>
    </>
  );
}
