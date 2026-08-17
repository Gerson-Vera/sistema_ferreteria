'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EscanerCodigoDialog from '@/modules/ventas/components/EscanerCodigoDialog';
import ClienteFormDialog from '@/modules/clientes/components/ClienteFormDialog';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { generarBoletaPDF } from '@/shared/utils/boleta-pdf';
import { clientesClientService } from '@/modules/clientes/services/clientes.client';
import { productosClientService } from '@/modules/productos/services/productos.client';
import { tiposPagoClientService } from '@/modules/tipos-pago/services/tipos-pago.client';
import { ventasClientService } from '@/modules/ventas/services/ventas.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import { stockAlmacenesClientService } from '@/modules/stock-almacenes/services/stock-almacenes.client';
import type { Cliente, CreateClienteDto } from '@/modules/clientes/types';
import type { Producto, ProductoConversion } from '@/modules/productos/types';
import type { TipoPago } from '@/modules/tipos-pago/types';
import type { Almacen } from '@/modules/almacenes/types';

type LineItem = {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  /** '' = unidad base; si no, id de la unidad alternativa. */
  unidadMedidaId: string;
  /** 1 unidad vendida = factor unidades base de stock. */
  factor: number;
};

const IGV_RATE = 0.18;
const fmt = (n: number) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

export default function NuevaVentaPage() {
  const router = useRouter();
  const showToast = useToast();
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [almacenId, setAlmacenId] = useState('');
  const [stockAlmacen, setStockAlmacen] = useState<Record<string, number>>({});
  const [conversiones, setConversiones] = useState<Record<string, ProductoConversion[]>>({});

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [tipoPagoId, setTipoPagoId] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Barcode scanner state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [escanerOpen, setEscanerOpen] = useState(false);

  // Registro de cliente nuevo sin salir de la venta
  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [creandoCliente, setCreandoCliente] = useState(false);

  useEffect(() => {
    clientesClientService.getAll({ limit: 200 }).then(r => setClientes(r.data)).catch(() => {});
    productosClientService.getAll({ limit: 500, activo: true }).then(r => setProductos(r.data)).catch(() => {});
    tiposPagoClientService.getAll(true).then(setTiposPago).catch(() => {});
    almacenesClientService.getAll(true).then(a => {
      setAlmacenes(a);
      if (a.length > 0) setAlmacenId(prev => prev || a[0].id);
    }).catch(() => {});
  }, []);

  // Stock disponible (físico − reservado) por producto en el almacén seleccionado
  useEffect(() => {
    if (!almacenId) { setStockAlmacen({}); return; }
    stockAlmacenesClientService.getAll({ almacenId, limit: 1000 })
      .then(r => {
        const map: Record<string, number> = {};
        for (const s of r.data) map[s.productoId] = s.disponible;
        setStockAlmacen(map);
      })
      .catch(() => setStockAlmacen({}));
  }, [almacenId]);

  const stockDe = (productoId: string) => stockAlmacen[productoId] ?? 0;

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0), [items]);
  const igv     = useMemo(() => Math.round(subtotal * IGV_RATE * 100) / 100, [subtotal]);
  const total   = useMemo(() => Math.round((subtotal + igv) * 100) / 100, [subtotal, igv]);

  // ── Cliente nuevo desde la venta ──────────────────────────────
  // El servidor valida que el documento (DNI/RUC/carnet) y el email no se repitan.
  const handleCrearCliente = async (data: CreateClienteDto) => {
    setCreandoCliente(true);
    try {
      const nuevo = await clientesClientService.create(data);
      setClientes(prev => [nuevo, ...prev]);
      setClienteSeleccionado(nuevo);
      setClienteFormOpen(false);
      showToast(`Cliente "${nuevo.nombre}" registrado y seleccionado`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al registrar cliente', 'error');
    } finally {
      setCreandoCliente(false);
    }
  };

  // ── Barcode scan ──────────────────────────────────────────────
  // Busca por código de barras/QR y agrega el producto. Compartido por
  // la pistola USB (input) y el escáner de cámara/imagen (diálogo).
  const buscarPorCodigo = async (codigo: string): Promise<{ ok: boolean; mensaje: string }> => {
    try {
      const res = await fetch(`/api/productos/barcode/${encodeURIComponent(codigo)}`);
      if (!res.ok) return { ok: false, mensaje: 'Producto no encontrado' };
      const json = await res.json();
      const prod: Producto = json.data;
      if (!prod.activo) return { ok: false, mensaje: `${prod.nombre} está inactivo` };
      agregarProducto(prod);
      return { ok: true, mensaje: prod.nombre };
    } catch {
      return { ok: false, mensaje: 'Error al buscar el producto' };
    }
  };

  const handleBarcodeScan = async () => {
    const codigo = barcodeInput.trim();
    if (!codigo) return;
    setBarcodeError(null);
    setBarcodeLoading(true);
    const res = await buscarPorCodigo(codigo);
    setBarcodeLoading(false);
    if (!res.ok) { setBarcodeError(`${res.mensaje}: ${codigo}`); return; }
    setBarcodeInput('');
    barcodeRef.current?.focus();
  };

  // ── Agregar producto (compartido por scan y autocomplete) ─────
  const agregarProducto = (prod: Producto) => {
    // Cargar las unidades alternativas del producto (caja, paquete…) si aún no están
    if (conversiones[prod.id] === undefined) {
      productosClientService.getConversiones(prod.id)
        .then(c => setConversiones(prev => ({ ...prev, [prod.id]: c })))
        .catch(() => setConversiones(prev => ({ ...prev, [prod.id]: [] })));
    }
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === prod.id);
      if (existe) {
        return prev.map(i =>
          i.producto.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        );
      }
      return [...prev, { producto: prod, cantidad: 1, precioUnitario: prod.precioVenta, unidadMedidaId: '', factor: 1 }];
    });
  };

  const cambiarUnidad = (idx: number, unidadMedidaId: string) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const conv = (conversiones[it.producto.id] ?? []).find(c => c.unidadMedidaId === unidadMedidaId);
      const factor = conv?.factor ?? 1;
      return {
        ...it,
        unidadMedidaId: conv ? unidadMedidaId : '',
        factor,
        // Precio sugerido proporcional a la unidad elegida
        precioUnitario: Math.round(it.producto.precioVenta * factor * 100) / 100,
      };
    }));
  };

  const addProductoDesdeSelect = () => {
    if (!productoSeleccionado) return;
    agregarProducto(productoSeleccionado);
    setProductoSeleccionado(null);
  };

  // ── Validación de stock (contra el almacén seleccionado, en unidades base) ─────
  const stockErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    for (const item of items) {
      const disponible = stockAlmacen[item.producto.id] ?? 0;
      const requerido = Math.round(item.cantidad * item.factor);
      if (requerido > disponible) {
        errs[item.producto.id] = item.factor > 1
          ? `Stock insuficiente: requiere ${requerido}, disponible ${disponible}`
          : `Stock insuficiente: disponible ${disponible}`;
      }
    }
    return errs;
  }, [items, stockAlmacen]);

  const hayStockError = Object.keys(stockErrors).length > 0;

  const updateCantidad = (idx: number, val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) setItems(prev => prev.map((it, i) => i === idx ? { ...it, cantidad: n } : it));
  };

  const updatePrecio = (idx: number, val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setItems(prev => prev.map((it, i) => i === idx ? { ...it, precioUnitario: n } : it));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  // ── Registrar venta ───────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    if (!clienteSeleccionado) { setError('Selecciona un cliente'); return; }
    if (!almacenId)           { setError('Selecciona un almacén'); return; }
    if (items.length === 0)   { setError('Agrega al menos un producto'); return; }
    if (hayStockError)        { setError('Corrige los productos con stock insuficiente antes de continuar'); return; }

    setSaving(true);
    try {
      const venta = await ventasClientService.create({
        clienteId: clienteSeleccionado.id,
        tipoPagoId: tipoPagoId || undefined,
        almacenId,
        items: items.map(i => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          unidadMedidaId: i.unidadMedidaId || undefined,
        })),
        observaciones: observaciones.trim() || undefined,
      });

      // Generar y descargar boleta PDF automáticamente
      const tipoPago = tiposPago.find(tp => tp.id === tipoPagoId);
      generarBoletaPDF({
        venta,
        clienteNombre: clienteSeleccionado.nombre,
        tipoPagoNombre: tipoPago?.nombre,
        items: items.map(i => ({
          nombre: i.producto.nombre,
          sku: i.producto.sku,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          subtotal: i.cantidad * i.precioUnitario,
        })),
      });

      showToast('Venta registrada — boleta descargada', 'success');
      router.push('/dashboard/ventas');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrar venta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Nueva Venta"
        subtitle="Registrar una nueva venta"
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/ventas')}>
            Volver
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={3}>

        {/* ── Cabecera: cliente + almacén + tipo de pago ── */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Stack direction="row" sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Cliente *</Typography>
                <Button
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setClienteFormOpen(true)}
                  sx={{ py: 0, minHeight: 0 }}
                >
                  Nuevo cliente
                </Button>
              </Stack>
              <Autocomplete
                options={clientes}
                getOptionLabel={c => `${c.nombre} — ${c.numeroDocumento}`}
                value={clienteSeleccionado}
                onChange={(_, val) => setClienteSeleccionado(val)}
                renderOption={(props, c) => (
                  <Box component="li" {...props} key={c.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.tipoDocumento}: {c.numeroDocumento}
                        {c.telefono ? ` · ${c.telefono}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Buscar cliente"
                    size="small"
                    helperText={clienteSeleccionado?.direccion ?? 'Nombre o número de documento'}
                  />
                )}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Almacén *</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Almacén</InputLabel>
                <Select
                  value={almacenId}
                  label="Almacén"
                  onChange={e => setAlmacenId(e.target.value)}
                >
                  {almacenes.map(a => (
                    <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Forma de pago</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Forma de pago</InputLabel>
                <Select
                  value={tipoPagoId}
                  label="Forma de pago"
                  onChange={e => setTipoPagoId(e.target.value)}
                >
                  <MenuItem value="">Sin especificar</MenuItem>
                  {tiposPago.map(tp => (
                    <MenuItem key={tp.id} value={tp.id}>{tp.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Agregar productos ── */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Productos</Typography>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {/* Escáner de código de barras */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                inputRef={barcodeRef}
                label="Escanear código de barras"
                size="small"
                fullWidth
                value={barcodeInput}
                onChange={e => { setBarcodeInput(e.target.value); setBarcodeError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeScan(); } }}
                disabled={barcodeLoading}
                placeholder="Escanea o escribe el código y presiona Enter"
                error={!!barcodeError}
                helperText={barcodeError ?? 'Presiona Enter o usa el escáner'}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon fontSize="small" color={barcodeLoading ? 'disabled' : 'action'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Escanear con cámara o subir imagen">
                          <IconButton size="small" color="primary" onClick={() => setEscanerOpen(true)}>
                            <CameraAltIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Autocomplete por nombre */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <Autocomplete
                options={productos}
                getOptionLabel={p => `${p.nombre} — S/ ${p.precioVenta.toFixed(2)}`}
                value={productoSeleccionado}
                onChange={(_, val) => setProductoSeleccionado(val)}
                renderOption={(props, p) => (
                  <Box component="li" {...props} key={p.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.sku} · Stock: {stockDe(p.id)} · S/ {p.precioVenta.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={params => (
                  <TextField {...params} label="Buscar por nombre" size="small" helperText=" " />
                )}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addProductoDesdeSelect}
                disabled={!productoSeleccionado}
                fullWidth
                sx={{ height: 40 }}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>

          {/* Alerta de stock insuficiente global */}
          {hayStockError && (
            <Alert severity="error" sx={{ mb: 1.5 }} icon={<WarningAmberIcon />}>
              Hay productos con cantidad mayor al stock disponible. Corrige antes de registrar la venta.
            </Alert>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>Unidad</TableCell>
                  <TableCell align="center" sx={{ width: 55 }}>Stock</TableCell>
                  <TableCell align="center" sx={{ width: 110 }}>Cantidad</TableCell>
                  <TableCell align="right" sx={{ width: 140 }}>Precio Unit.</TableCell>
                  <TableCell align="right" sx={{ width: 130 }}>Subtotal</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sin productos — usa el escáner o el buscador
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => {
                    const stockErr = stockErrors[item.producto.id];
                    return (
                      <TableRow
                        key={item.producto.id}
                        sx={{ bgcolor: stockErr ? 'error.lighter' : undefined }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.producto.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.producto.sku}
                            {item.producto.codigoBarras ? ` · ${item.producto.codigoBarras}` : ''}
                          </Typography>
                          {stockErr && (
                            <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                              <WarningAmberIcon sx={{ fontSize: 12 }} /> {stockErr}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {(conversiones[item.producto.id] ?? []).length > 0 ? (
                            <FormControl size="small" fullWidth>
                              <Select
                                value={item.unidadMedidaId}
                                onChange={e => cambiarUnidad(idx, e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">Unidad</MenuItem>
                                {(conversiones[item.producto.id] ?? []).map(c => (
                                  <MenuItem key={c.unidadMedidaId} value={c.unidadMedidaId}>
                                    {c.unidadCodigo} (×{c.factor})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                          {item.factor > 1 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                              = {Math.round(item.cantidad * item.factor)} unid. base
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={stockDe(item.producto.id)}
                            size="small"
                            color={stockDe(item.producto.id) <= item.producto.stockMinimo ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip
                            title={stockErr ?? ''}
                            open={!!stockErr}
                            placement="top"
                            arrow
                          >
                            <TextField
                              type="number"
                              value={item.cantidad}
                              onChange={e => updateCantidad(idx, e.target.value)}
                              size="small"
                              sx={{ width: 85 }}
                              error={!!stockErr}
                              slotProps={{ htmlInput: { min: 1, max: Math.floor(stockDe(item.producto.id) / item.factor), style: { textAlign: 'center' } } }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.precioUnitario}
                            onChange={e => updatePrecio(idx, e.target.value)}
                            size="small"
                            sx={{ width: 115 }}
                            slotProps={{ htmlInput: { min: 0.01, step: 0.01, style: { textAlign: 'right' } } }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {fmt(item.cantidad * item.precioUnitario)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ── Observaciones + totales ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            multiline
            rows={3}
            sx={{ flex: 1 }}
            size="small"
            placeholder="Notas adicionales sobre la venta..."
          />
          <Paper variant="outlined" sx={{ p: 2, minWidth: 260 }}>
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
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                  {fmt(total)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => router.push('/dashboard/ventas')} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || items.length === 0 || !clienteSeleccionado || !almacenId || hayStockError}
          >
            {saving ? 'Guardando...' : 'Registrar Venta y Descargar Boleta'}
          </Button>
        </Box>
      </Stack>

      {/* Escáner con cámara en vivo o foto (QR y códigos de barras) */}
      <EscanerCodigoDialog
        open={escanerOpen}
        onClose={() => setEscanerOpen(false)}
        onDetect={buscarPorCodigo}
      />

      {/* Registrar cliente nuevo sin salir de la venta */}
      <ClienteFormDialog
        open={clienteFormOpen}
        onClose={() => setClienteFormOpen(false)}
        onSubmit={handleCrearCliente}
        loading={creandoCliente}
      />
    </>
  );
}
