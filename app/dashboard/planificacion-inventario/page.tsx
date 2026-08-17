'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';
import { useToast } from '@/shared/context/ToastContext';
import { ordenesCompraClientService } from '@/modules/ordenes-compra/services/ordenes-compra.client';

type ProductoPlanificacion = {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  puntoReorden: number;
  puntoReordenEfectivo: number;
  demandaDiaria: number;
  leadTimeDias: number;
  cantidadSugerida: number;
  costoSugerido: number;
  precioCompra: number;
  estado: 'critico' | 'reorden';
  categoria: string;
  proveedor: { id: string; nombre: string; telefono: string | null } | null;
};

type Resumen = { total: number; criticos: number; reorden: number; totalCosto: number };

export default function PlanificacionInventarioPage() {
  const showToast = useToast();
  const [productos, setProductos] = useState<ProductoPlanificacion[]>([]);
  const [resumen, setResumen]     = useState<Resumen>({ total: 0, criticos: 0, reorden: 0, totalCosto: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'critico' | 'reorden'>('todos');
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [generando, setGenerando] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/planificacion-inventario');
      const json = await res.json();
      setProductos(json.data.productos ?? []);
      setResumen(json.data.resumen ?? { total: 0, criticos: 0, reorden: 0, totalCosto: 0 });
      setSeleccion(new Set());
    } catch {
      setError('No se pudo cargar la planificación de inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtrados = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const fmtCurrency = (n: number) =>
    `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Selección para generar OC ─────────────────────────────────
  const toggle = (id: string) =>
    setSeleccion(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtradosConProveedor = useMemo(() => filtrados.filter(p => p.proveedor), [filtrados]);
  const allChecked = filtradosConProveedor.length > 0 && filtradosConProveedor.every(p => seleccion.has(p.id));
  const someChecked = filtradosConProveedor.some(p => seleccion.has(p.id));

  const toggleAll = () =>
    setSeleccion(allChecked ? new Set() : new Set(filtradosConProveedor.map(p => p.id)));

  const seleccionados = productos.filter(p => seleccion.has(p.id));
  const costoSeleccion = seleccionados.reduce((s, p) => s + p.costoSugerido, 0);

  const handleGenerarOC = async () => {
    if (seleccionados.length === 0) return;
    setGenerando(true);
    try {
      // Una OC por proveedor con las cantidades sugeridas
      const porProveedor = new Map<string, { nombre: string; items: ProductoPlanificacion[] }>();
      for (const p of seleccionados) {
        if (!p.proveedor) continue;
        const grupo = porProveedor.get(p.proveedor.id) ?? { nombre: p.proveedor.nombre, items: [] };
        grupo.items.push(p);
        porProveedor.set(p.proveedor.id, grupo);
      }

      let creadas = 0;
      for (const [proveedorId, grupo] of porProveedor) {
        await ordenesCompraClientService.create({
          proveedorId,
          observaciones: 'Generada desde Planificación de Inventario',
          items: grupo.items.map(p => ({
            productoId: p.id,
            descripcion: p.nombre,
            cantidad: p.cantidadSugerida,
            costoUnitario: p.precioCompra > 0 ? p.precioCompra : 0.01,
            esNuevoProducto: false,
          })),
        });
        creadas++;
      }

      showToast(
        creadas === 1
          ? 'Se generó 1 orden de compra en borrador'
          : `Se generaron ${creadas} órdenes de compra en borrador (una por proveedor)`,
        'success',
      );
      setSeleccion(new Set());
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al generar órdenes de compra', 'error');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Planificación de Inventario"
        subtitle="Sugerencias de compra según demanda real y tiempo de entrega del proveedor"
        action={
          <Button
            variant="contained"
            startIcon={generando ? <CircularProgress size={16} color="inherit" /> : <PostAddIcon />}
            disabled={seleccionados.length === 0 || generando}
            onClick={handleGenerarOC}
          >
            {generando
              ? 'Generando…'
              : seleccionados.length > 0
                ? `Generar OC (${seleccionados.length}) · ${fmtCurrency(costoSeleccion)}`
                : 'Generar OC'}
          </Button>
        }
      />

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
        <StatCard title="Productos a reponer" value={resumen.total} color="warning" icon={<AssignmentIcon />} />
        <StatCard title="Estado crítico" value={resumen.criticos} color="error" icon={<ReportProblemIcon />} />
        <StatCard title="En punto de reorden" value={resumen.reorden} color="warning" icon={<WarningAmberIcon />} />
        <StatCard
          title="Inversión estimada"
          value={fmtCurrency(resumen.totalCosto)}
          color="primary"
          icon={<ShoppingCartIcon />}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar producto o SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 280 }}
          />
          <ToggleButtonGroup
            size="small"
            value={filtroEstado}
            exclusive
            onChange={(_, v) => v && setFiltroEstado(v)}
          >
            <ToggleButton value="todos">Todos</ToggleButton>
            <ToggleButton value="critico">Crítico</ToggleButton>
            <ToggleButton value="reorden">Reorden</ToggleButton>
          </ToggleButtonGroup>
          {seleccionados.length > 0 && (
            <Chip
              label={`${seleccionados.length} seleccionado(s) · ${fmtCurrency(costoSeleccion)}`}
              color="primary"
              size="small"
              onDelete={() => setSeleccion(new Set())}
            />
          )}
        </Box>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtrados.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {resumen.total === 0
                ? 'No hay productos que requieran reposición'
                : 'No se encontraron productos con ese filtro'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allChecked}
                      indeterminate={someChecked && !allChecked}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Proveedor</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Stock</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Demanda/día</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>P. Reorden</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Mín / Máx</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Cant. Sugerida</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Costo Est.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map(p => (
                  <TableRow
                    key={p.id}
                    hover
                    onClick={p.proveedor ? () => toggle(p.id) : undefined}
                    sx={{
                      cursor: p.proveedor ? 'pointer' : 'default',
                      bgcolor: p.estado === 'critico' ? 'rgba(239,68,68,0.04)' : 'inherit',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Tooltip title={p.proveedor ? '' : 'Sin proveedor asignado — asígnale uno en Productos para incluirlo en una OC'}>
                        <span>
                          <Checkbox
                            size="small"
                            checked={seleccion.has(p.id)}
                            disabled={!p.proveedor}
                            onChange={() => toggle(p.id)}
                            onClick={e => e.stopPropagation()}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'monospace' }}>
                        {p.sku} · {p.categoria}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {p.proveedor ? (
                        <>
                          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{p.proveedor.nombre}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                            {p.leadTimeDias > 0 ? `Entrega: ${p.leadTimeDias} día(s)` : 'Sin lead time'}
                            {p.proveedor.telefono ? ` · ${p.proveedor.telefono}` : ''}
                          </Typography>
                        </>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: p.estado === 'critico' ? '#EF4444' : '#F59E0B',
                        }}
                      >
                        {p.stock}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12, color: p.demandaDiaria > 0 ? 'text.primary' : 'text.disabled' }}>
                        {p.demandaDiaria > 0 ? p.demandaDiaria : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{p.puntoReordenEfectivo}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        {p.puntoReorden > 0 ? 'manual' : 'auto'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {p.stockMinimo} / {p.stockMaximo > 0 ? p.stockMaximo : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1565C0' }}>
                        {p.cantidadSugerida}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                        {fmtCurrency(p.costoSugerido)}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        {fmtCurrency(p.precioCompra)} c/u
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={p.estado === 'critico' ? 'Crítico' : 'Reorden'}
                        size="small"
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: p.estado === 'critico' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: p.estado === 'critico' ? '#EF4444' : '#B45309',
                          border: `1px solid ${p.estado === 'critico' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filtrados.length > 0 && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 3,
            }}
          >
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              Total estimado:{' '}
              {fmtCurrency(filtrados.reduce((s, p) => s + p.costoSugerido, 0))}
            </Typography>
          </Box>
        )}
      </Paper>
    </>
  );
}
