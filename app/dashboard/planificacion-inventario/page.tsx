'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import Typography from '@mui/material/Typography';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

type ProductoPlanificacion = {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  puntoReorden: number;
  cantidadSugerida: number;
  costoSugerido: number;
  precioCompra: number;
  estado: 'critico' | 'reorden';
  categoria: string;
  proveedor: { id: string; nombre: string; telefono: string | null } | null;
};

type Resumen = { total: number; criticos: number; reorden: number; totalCosto: number };

export default function PlanificacionInventarioPage() {
  const [productos, setProductos] = useState<ProductoPlanificacion[]>([]);
  const [resumen, setResumen]     = useState<Resumen>({ total: 0, criticos: 0, reorden: 0, totalCosto: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'critico' | 'reorden'>('todos');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/planificacion-inventario');
      const json = await res.json();
      setProductos(json.data.productos ?? []);
      setResumen(json.data.resumen ?? { total: 0, criticos: 0, reorden: 0, totalCosto: 0 });
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

  return (
    <>
      <PageHeader
        title="Planificación de Inventario"
        subtitle="Sugerencias de compra basadas en stock mínimo y punto de reorden"
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
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Proveedor</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Stock</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Mín / Máx</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>P. Reorden</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Cant. Sugerida</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Costo Est.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map(p => (
                  <TableRow
                    key={p.id}
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      bgcolor: p.estado === 'critico' ? 'rgba(239,68,68,0.04)' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'monospace' }}>{p.sku}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }}>{p.categoria}</Typography>
                    </TableCell>
                    <TableCell>
                      {p.proveedor ? (
                        <>
                          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{p.proveedor.nombre}</Typography>
                          {p.proveedor.telefono && (
                            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{p.proveedor.telefono}</Typography>
                          )}
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
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {p.stockMinimo} / {p.stockMaximo > 0 ? p.stockMaximo : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {p.puntoReorden > 0 ? p.puntoReorden : '—'}
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
