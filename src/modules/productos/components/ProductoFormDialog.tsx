'use client';
import { useState, useEffect, useRef } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import type { Categoria } from '@/modules/categorias/types';
import type { Marca } from '@/modules/marcas/types';
import type { UnidadMedida } from '@/modules/unidades-medida/types';
import type { Proveedor } from '@/modules/proveedores/types';
import type { Almacen } from '@/modules/almacenes/types';
import { categoriasClientService } from '@/modules/categorias/services/categorias.client';
import { marcasClientService } from '@/modules/marcas/services/marcas.client';
import { unidadesMedidaClientService } from '@/modules/unidades-medida/services/unidades-medida.client';
import { proveedoresClientService } from '@/modules/proveedores/services/proveedores.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import { productosClientService } from '../services/productos.client';
import type { Producto, CreateProductoDto } from '../types';

type FormErrors = Partial<Record<keyof FormState, string>>;

type FormState = {
  nombre: string;
  descripcion: string;
  codigoBarras: string;
  img: string;
  categoriaId: string;
  marcaId: string;
  unidadMedidaId: string;
  proveedorId: string;
  almacenId: string;
  ubicacion: string;
  precioCompra: string;
  precioVenta: string;
  stock: string;
  stockMinimo: string;
  stockMaximo: string;
  puntoReorden: string;
};

const emptyForm: FormState = {
  nombre: '',
  descripcion: '',
  codigoBarras: '',
  img: '',
  categoriaId: '',
  marcaId: '',
  unidadMedidaId: '',
  proveedorId: '',
  almacenId: '',
  ubicacion: '',
  precioCompra: '',
  precioVenta: '',
  stock: '0',
  stockMinimo: '0',
  stockMaximo: '0',
  puntoReorden: '0',
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
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [suggestedMarcaIds, setSuggestedMarcaIds] = useState<Set<string>>(new Set());
  const [suggestedProveedorIds, setSuggestedProveedorIds] = useState<Set<string>>(new Set());
  const [suggestedUnidadId, setSuggestedUnidadId] = useState<string | null>(null);
  const [suggestedAlmacenId, setSuggestedAlmacenId] = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    marcasClientService.getAll().then(setMarcas).catch(() => {});
    unidadesMedidaClientService.getAll().then(setUnidades).catch(() => {});
    proveedoresClientService.getAll({ limit: 200 }).then(r => setProveedores(r.data)).catch(() => {});
    almacenesClientService.getAll(true).then(setAlmacenes).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              nombre: initialData.nombre,
              descripcion: initialData.descripcion ?? '',
              codigoBarras: initialData.codigoBarras ?? '',
              img: initialData.img ?? '',
              categoriaId: initialData.categoriaId,
              marcaId: initialData.marcaId ?? '',
              unidadMedidaId: initialData.unidadMedidaId ?? '',
              proveedorId: initialData.proveedorId ?? '',
              almacenId: initialData.almacenId ?? '',
              ubicacion: initialData.ubicacion ?? '',
              precioCompra: String(initialData.precioCompra),
              precioVenta: String(initialData.precioVenta),
              stock: String(initialData.stock),
              stockMinimo: String(initialData.stockMinimo),
              stockMaximo: String(initialData.stockMaximo),
              puntoReorden: String(initialData.puntoReorden),
            }
          : emptyForm,
      );
      setErrors({});
      setImgError(null);
    }
  }, [open, initialData]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleCategoriaChange = async (newCategoriaId: string) => {
    setSuggestedMarcaIds(new Set());
    setSuggestedProveedorIds(new Set());
    setSuggestedUnidadId(null);
    setSuggestedAlmacenId(null);

    if (!newCategoriaId) {
      setForm(prev => ({
        ...prev,
        categoriaId: '',
        marcaId: '',
        unidadMedidaId: '',
        almacenId: '',
        proveedorId: '',
        ubicacion: '',
      }));
      setErrors(prev => ({ ...prev, categoriaId: undefined }));
      return;
    }

    setForm(prev => ({ ...prev, categoriaId: newCategoriaId }));
    setErrors(prev => ({ ...prev, categoriaId: undefined }));
    if (initialData) return;

    try {
      const cfg = await categoriasClientService.getConfig(newCategoriaId);
      const autoAlmacen = cfg.almacenId
        ? almacenes.find(a => a.id === cfg.almacenId)
        : null;

      setForm(prev => ({
        ...prev,
        unidadMedidaId: cfg.unidadMedidaId ?? '',
        almacenId: cfg.almacenId ?? '',
        marcaId: cfg.marcaIds[0] ?? '',
        proveedorId: cfg.proveedorIds[0] ?? '',
        ubicacion: autoAlmacen ? autoAlmacen.nombre : prev.ubicacion,
      }));
      setSuggestedMarcaIds(new Set(cfg.marcaIds));
      setSuggestedProveedorIds(new Set(cfg.proveedorIds));
      setSuggestedUnidadId(cfg.unidadMedidaId);
      setSuggestedAlmacenId(cfg.almacenId);
    } catch {
      // no config set — keep form as is
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError(null);
    setImgUploading(true);
    try {
      const url = await productosClientService.upload(file);
      setForm(prev => ({ ...prev, img: url }));
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setImgUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const catSelected = !!form.categoriaId;
  const catFiltered = suggestedMarcaIds.size > 0 || suggestedUnidadId !== null;

  const displayMarcas = suggestedMarcaIds.size > 0
    ? marcas.filter(m => m.activo && suggestedMarcaIds.has(m.id))
    : marcas.filter(m => m.activo);

  const displayProveedores = suggestedProveedorIds.size > 0
    ? proveedores.filter(p => p.activo && suggestedProveedorIds.has(p.id))
    : proveedores.filter(p => p.activo);

  const displayUnidades = suggestedUnidadId
    ? unidades.filter(u => u.activo && u.id === suggestedUnidadId)
    : unidades.filter(u => u.activo);

  const displayAlmacenes = suggestedAlmacenId
    ? almacenes.filter(a => a.id === suggestedAlmacenId)
    : almacenes;

  const pc = parseFloat(form.precioCompra);
  const pv = parseFloat(form.precioVenta);
  const st = parseInt(form.stock, 10);
  const sm = parseInt(form.stockMinimo, 10);
  const smx = parseInt(form.stockMaximo, 10);
  const pr = parseInt(form.puntoReorden, 10);

  const precioWarning = !isNaN(pc) && !isNaN(pv) && pc >= pv
    ? 'El precio de compra es mayor o igual al precio de venta — revisa el margen.'
    : null;

  const stockWarning = !initialData && !isNaN(st) && !isNaN(sm) && sm > st
    ? 'El stock mínimo supera el stock inicial — el producto comenzará en alerta de reposición.'
    : null;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.categoriaId) e.categoriaId = 'Selecciona una categoría';
    if (isNaN(pc) || pc <= 0) e.precioCompra = 'Debe ser mayor a 0';
    if (isNaN(pv) || pv <= 0) e.precioVenta = 'Debe ser mayor a 0';
    if (isNaN(st) || st < 0) e.stock = 'Debe ser ≥ 0';
    if (isNaN(sm) || sm < 0) e.stockMinimo = 'Debe ser ≥ 0';
    if (isNaN(smx) || smx < 0) e.stockMaximo = 'Debe ser ≥ 0';
    if (isNaN(pr) || pr < 0) e.puntoReorden = 'Debe ser ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      codigoBarras: form.codigoBarras.trim() || undefined,
      img: form.img || undefined,
      categoriaId: form.categoriaId,
      marcaId: form.marcaId || undefined,
      unidadMedidaId: form.unidadMedidaId || undefined,
      proveedorId: form.proveedorId || undefined,
      almacenId: form.almacenId || undefined,
      ubicacion: form.ubicacion.trim() || undefined,
      precioCompra: pc,
      precioVenta: pv,
      stock: st,
      stockMinimo: sm,
      stockMaximo: smx,
      puntoReorden: pr,
    });
  };

  const disabled = loading || imgUploading;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Grid container spacing={2}>

          {/* ── Alertas de validación ── */}
          {precioWarning && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning" icon={<InfoOutlinedIcon />}>{precioWarning}</Alert>
            </Grid>
          )}
          {stockWarning && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" icon={<InfoOutlinedIcon />}>{stockWarning}</Alert>
            </Grid>
          )}

          {/* ── Identificación ── */}
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
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth required error={!!errors.categoriaId} disabled={disabled}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={form.categoriaId}
                label="Categoría"
                onChange={e => handleCategoriaChange(e.target.value)}
              >
                {categorias.filter(c => c.activo).map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.descripcion}</MenuItem>
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
              disabled={disabled}
            />
          </Grid>

          {/* ── Clasificación ── */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 0.5 }}><Typography variant="caption" color="text.secondary">Clasificación</Typography></Divider>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Tooltip title="Si lo dejas vacío se generará un código EAN-13 automáticamente" placement="top">
              <TextField
                label="Código de barras"
                fullWidth
                value={form.codigoBarras}
                onChange={set('codigoBarras')}
                disabled={disabled}
                placeholder="Auto-generado si se deja vacío"
              />
            </Tooltip>
          </Grid>
          {catFiltered && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 500 }}>
                ● Marca, unidad, almacén y proveedor filtrados según la categoría seleccionada
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth disabled={disabled || !catSelected}>
              <InputLabel>Marca</InputLabel>
              <Select
                value={form.marcaId}
                label="Marca"
                onChange={e => setForm(prev => ({ ...prev, marcaId: e.target.value }))}
              >
                {!suggestedMarcaIds.size && <MenuItem value="">Sin marca</MenuItem>}
                {displayMarcas.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
                ))}
              </Select>
              {catFiltered && (
                <FormHelperText>Solo marcas de esta categoría</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth disabled={disabled || !catSelected}>
              <InputLabel>Unidad de medida</InputLabel>
              <Select
                value={form.unidadMedidaId}
                label="Unidad de medida"
                onChange={e => setForm(prev => ({ ...prev, unidadMedidaId: e.target.value }))}
              >
                {!suggestedUnidadId && <MenuItem value="">Sin unidad</MenuItem>}
                {displayUnidades.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.codigo} — {u.nombre}</MenuItem>
                ))}
              </Select>
              {catFiltered && (
                <FormHelperText>Unidad configurada para esta categoría</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth disabled={disabled || !catSelected}>
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={form.proveedorId}
                label="Proveedor"
                onChange={e => setForm(prev => ({ ...prev, proveedorId: e.target.value }))}
              >
                {!suggestedProveedorIds.size && <MenuItem value="">Sin proveedor</MenuItem>}
                {displayProveedores.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                ))}
              </Select>
              {catFiltered && (
                <FormHelperText>Solo proveedores de esta categoría</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth disabled={disabled || !catSelected}>
              <InputLabel>Almacén</InputLabel>
              <Select
                value={form.almacenId}
                label="Almacén"
                onChange={e => setForm(prev => ({ ...prev, almacenId: e.target.value }))}
              >
                {!suggestedAlmacenId && <MenuItem value="">Sin almacén</MenuItem>}
                {displayAlmacenes.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                ))}
              </Select>
              {catFiltered && (
                <FormHelperText>Almacén configurado para esta categoría</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Ubicación en almacén"
              fullWidth
              value={form.ubicacion}
              onChange={set('ubicacion')}
              disabled={disabled || !catSelected}
              placeholder="Ej: Estante A-3"
            />
          </Grid>

          {/* ── Precios y stock ── */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 0.5 }}><Typography variant="caption" color="text.secondary">Precios y stock</Typography></Divider>
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
              disabled={disabled}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
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
              helperText={errors.precioVenta ?? (
                !isNaN(pc) && !isNaN(pv) && pv > pc
                  ? `Margen: ${(((pv - pc) / pc) * 100).toFixed(1)}%`
                  : undefined
              )}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
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
              helperText={errors.stock ?? (initialData ? 'Usar ajuste de inventario para modificar' : undefined)}
              disabled={disabled || !!initialData}
              slotProps={{ htmlInput: { min: 0 } }}
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
              helperText={errors.stockMinimo ?? 'Alerta cuando el stock llegue a este nivel'}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Stock Máximo"
              fullWidth
              type="number"
              value={form.stockMaximo}
              onChange={set('stockMaximo')}
              error={!!errors.stockMaximo}
              helperText={errors.stockMaximo ?? 'Cantidad máxima a mantener en almacén'}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Punto de Reorden"
              fullWidth
              type="number"
              value={form.puntoReorden}
              onChange={set('puntoReorden')}
              error={!!errors.puntoReorden}
              helperText={errors.puntoReorden ?? 'Nivel para generar sugerencia de compra'}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>

          {/* Stock actual al editar */}
          {initialData && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: initialData.stock <= initialData.stockMinimo ? 'warning.light' : 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Stock actual:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: initialData.stock <= initialData.stockMinimo ? 'warning.dark' : 'success.dark',
                  }}
                >
                  {initialData.stock} unidades
                  {initialData.stock <= initialData.stockMinimo && ' ⚠ Bajo mínimo'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (Mínimo: {initialData.stockMinimo})
                </Typography>
              </Box>
            </Grid>
          )}

          {/* ── Imagen ── */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 0.5 }}><Typography variant="caption" color="text.secondary">Imagen</Typography></Divider>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {form.img ? (
                <Box
                  component="img"
                  src={form.img}
                  alt="Imagen del producto"
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider', flexShrink: 0 }}
                />
              ) : (
                <Box sx={{ width: 80, height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PhotoCameraIcon sx={{ color: 'text.disabled' }} />
                </Box>
              )}
              <Box>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileRef.current?.click()}
                  disabled={disabled}
                  startIcon={imgUploading ? <CircularProgress size={14} /> : <PhotoCameraIcon />}
                >
                  {imgUploading ? 'Subiendo...' : form.img ? 'Cambiar imagen' : 'Subir imagen'}
                </Button>
                {form.img && !imgUploading && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setForm(prev => ({ ...prev, img: '' }))}
                    disabled={disabled}
                    sx={{ ml: 1 }}
                  >
                    Quitar
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  JPG, PNG o WEBP · máx. 5 MB
                </Typography>
                {imgError && (
                  <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                    {imgError}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={disabled}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
