'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { proveedoresClientService } from '@/modules/proveedores/services/proveedores.client';
import { productosClientService } from '@/modules/productos/services/productos.client';
import { categoriasClientService } from '@/modules/categorias/services/categorias.client';
import { ordenesCompraClientService } from '@/modules/ordenes-compra/services/ordenes-compra.client';
import type { Proveedor } from '@/modules/proveedores/types';
import type { Producto } from '@/modules/productos/types';
import type { Categoria } from '@/modules/categorias/types';
import type { CreateOrdenItemDto } from '@/modules/ordenes-compra/types';

type LineItem = {
  key: string;
  esNuevo: boolean;
  producto: Producto | null;
  descripcion: string;
  detalles: string;
  cantidad: number;
  costoUnitario: number;
  precioVentaSugerido: number | '';
  categoriaId: string;
};

const IGV = 0.18;
const fmt = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
let keyCounter = 0;
const newKey = () => String(++keyCounter);

function emptyLine(esNuevo = false): LineItem {
  return {
    key: newKey(),
    esNuevo,
    producto: null,
    descripcion: '',
    detalles: '',
    cantidad: 1,
    costoUnitario: 0,
    precioVentaSugerido: '',
    categoriaId: '',
  };
}

export default function NuevaOrdenCompraPage() {
  const router = useRouter();
  const showToast = useToast();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [proveedor, setProveedor]     = useState<Proveedor | null>(null);
  const [productosProveedor, setProductosProveedor] = useState<Producto[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    proveedoresClientService.getAll({ limit: 200 }).then(r => setProveedores(r.data)).catch(() => {});
    categoriasClientService.getAll().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    if (!proveedor) { setProductosProveedor([]); return; }
    productosClientService
      .getAll({ limit: 500, activo: true, proveedorId: proveedor.id })
      .then(r => setProductosProveedor(r.data))
      .catch(() => {});
  }, [proveedor]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0), [items]);
  const igv      = useMemo(() => Math.round(subtotal * IGV * 100) / 100, [subtotal]);
  const total    = useMemo(() => Math.round((subtotal + igv) * 100) / 100, [subtotal, igv]);

  const addLine = (esNuevo = false) => setItems(prev => [...prev, emptyLine(esNuevo)]);

  const updateLine = <K extends keyof LineItem>(key: string, field: K, value: LineItem[K]) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i));
  };

  const removeLine = (key: string) => setItems(prev => prev.filter(i => i.key !== key));

  const toggleTipo = (key: string, esNuevo: boolean) => {
    setItems(prev => prev.map(i =>
      i.key === key ? { ...i, esNuevo, producto: null, descripcion: '', detalles: '', costoUnitario: 0 } : i,
    ));
  };

  const selectProducto = (key: string, prod: Producto | null) => {
    setItems(prev => prev.map(i =>
      i.key === key
        ? { ...i, producto: prod, descripcion: prod?.nombre ?? '', costoUnitario: prod?.precioCompra ?? 0 }
        : i,
    ));
  };

  const validate = (): string | null => {
    if (!proveedor) return 'Selecciona un proveedor';
    if (items.length === 0) return 'Agrega al menos un producto';
    for (const item of items) {
      if (!item.descripcion.trim()) return 'Todos los ítems deben tener descripción';
      if (item.cantidad < 1) return 'La cantidad debe ser al menos 1';
      if (item.costoUnitario <= 0) return 'El costo unitario debe ser mayor a 0';
      if (item.esNuevo && !item.categoriaId) return 'Los productos nuevos deben tener categoría';
    }
    return null;
  };

  const buildDto = (): CreateOrdenItemDto[] =>
    items.map(i => ({
      productoId: i.producto?.id,
      descripcion: i.descripcion.trim(),
      detalles: i.detalles.trim() || undefined,
      cantidad: i.cantidad,
      costoUnitario: i.costoUnitario,
      esNuevoProducto: i.esNuevo,
      precioVentaSugerido: i.precioVentaSugerido ? Number(i.precioVentaSugerido) : undefined,
      categoriaId: i.categoriaId || undefined,
    }));

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSaving(true);
    try {
      await ordenesCompraClientService.create({
        proveedorId: proveedor!.id,
        observaciones: observaciones.trim() || undefined,
        items: buildDto(),
      });
      showToast('Orden de compra creada', 'success');
      router.push('/dashboard/ordenes-compra');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear orden');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Nueva Orden de Compra"
        subtitle="Pedido a proveedor para productos existentes o nuevos"
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/ordenes-compra')}>
            Volver
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={3}>
        {/* Proveedor */}
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Proveedor</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Autocomplete
              options={proveedores}
              getOptionLabel={p => p.ruc ? `${p.nombre} — ${p.ruc}` : p.nombre}
              value={proveedor}
              onChange={(_, val) => setProveedor(val)}
              renderInput={params => (
                <TextField {...params} label="Seleccionar proveedor *" size="small" />
              )}
              sx={{ flex: 1, maxWidth: 480 }}
            />
            {proveedor?.email && (
              <Chip
                label={proveedor.email}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: 12 }}
              />
            )}
            {proveedor && !proveedor.email && (
              <Alert severity="warning" sx={{ py: 0, fontSize: 12 }}>
                Sin email — no se podrá enviar por correo
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Ítems */}
        <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Productos a ordenar</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addLine(false)}>
                Producto existente
              </Button>
              <Button size="small" variant="outlined" color="secondary" startIcon={<NewReleasesIcon />} onClick={() => addLine(true)}>
                Producto nuevo
              </Button>
            </Stack>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, width: 110 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Producto / Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, width: 100 }}>Cant.</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, width: 130 }}>Costo Unit.</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, width: 110 }}>Subtotal</TableCell>
                  <TableCell sx={{ width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Usa los botones de arriba para agregar productos
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {items.map(item => (
                  <TableRow key={item.key} sx={{ verticalAlign: 'top', '& td': { py: 1.5 } }}>
                    {/* Tipo toggle */}
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} spacing={0.3}>
                        <Switch
                          size="small"
                          checked={item.esNuevo}
                          onChange={e => toggleTipo(item.key, e.target.checked)}
                        />
                        <Typography sx={{ fontSize: 10, color: item.esNuevo ? 'secondary.main' : 'text.secondary' }}>
                          {item.esNuevo ? 'Nuevo' : 'Existente'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Descripción */}
                    <TableCell>
                      {!item.esNuevo ? (
                        <Autocomplete
                          size="small"
                          options={productosProveedor}
                          getOptionLabel={p => `${p.sku} — ${p.nombre}`}
                          value={item.producto}
                          onChange={(_, val) => selectProducto(item.key, val)}
                          renderInput={params => (
                            <TextField
                              {...params}
                              placeholder="Buscar producto del proveedor"
                              size="small"
                            />
                          )}
                          sx={{ mb: 0.5 }}
                          noOptionsText={proveedor ? 'Sin productos para este proveedor' : 'Selecciona un proveedor primero'}
                        />
                      ) : (
                        <>
                          <TextField
                            size="small"
                            placeholder="Nombre del producto *"
                            fullWidth
                            value={item.descripcion}
                            onChange={e => updateLine(item.key, 'descripcion', e.target.value)}
                            sx={{ mb: 0.75 }}
                          />
                          <TextField
                            size="small"
                            placeholder="Detalle / especificaciones (opcional)"
                            fullWidth
                            value={item.detalles}
                            onChange={e => updateLine(item.key, 'detalles', e.target.value)}
                            sx={{ mb: 0.75 }}
                          />
                          <Stack direction="row" spacing={1}>
                            <FormControl size="small" sx={{ minWidth: 160 }} error={!item.categoriaId}>
                              <InputLabel>Categoría *</InputLabel>
                              <Select
                                value={item.categoriaId}
                                label="Categoría *"
                                onChange={e => updateLine(item.key, 'categoriaId', e.target.value)}
                              >
                                {categorias.filter(c => c.activo).map(c => (
                                  <MenuItem key={c.id} value={c.id}>{c.descripcion}</MenuItem>
                                ))}
                              </Select>
                              {!item.categoriaId && <FormHelperText>Requerido</FormHelperText>}
                            </FormControl>
                            <TextField
                              size="small"
                              type="number"
                              placeholder="P. Venta sugerido"
                              value={item.precioVentaSugerido}
                              onChange={e => updateLine(item.key, 'precioVentaSugerido', e.target.value as unknown as number | '')}
                              sx={{ width: 170 }}
                              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                            />
                          </Stack>
                        </>
                      )}
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.cantidad}
                        onChange={e => updateLine(item.key, 'cantidad', Math.max(1, parseInt(e.target.value) || 1))}
                        sx={{ width: 80 }}
                        slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }}
                      />
                    </TableCell>

                    {/* Costo */}
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.costoUnitario || ''}
                        onChange={e => updateLine(item.key, 'costoUnitario', parseFloat(e.target.value) || 0)}
                        sx={{ width: 110 }}
                        slotProps={{ htmlInput: { min: 0, step: 0.01, style: { textAlign: 'right' } } }}
                      />
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, pt: 0.5 }}>
                        {fmt(item.cantidad * item.costoUnitario)}
                      </Typography>
                    </TableCell>

                    {/* Delete */}
                    <TableCell>
                      <Tooltip title="Quitar ítem">
                        <IconButton size="small" color="error" onClick={() => removeLine(item.key)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Totales y observaciones */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Observaciones"
            multiline
            rows={3}
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            sx={{ flex: 1 }}
            size="small"
            placeholder="Instrucciones especiales, fecha de entrega esperada, etc."
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
                <Typography variant="subtitle2">Total estimado</Typography>
                <Typography variant="subtitle2" color="primary">{fmt(total)}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        {/* Acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => router.push('/dashboard/ordenes-compra')} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || items.length === 0}
          >
            {saving ? 'Guardando...' : 'Guardar Orden'}
          </Button>
        </Box>
      </Stack>
    </>
  );
}
