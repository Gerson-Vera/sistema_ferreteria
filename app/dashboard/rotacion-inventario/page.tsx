'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

type ProductoRotacion = {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidadesVendidas: number;
  ingresoTotal: number;
  rotacionAnual: number;
  diasInventario: number;
  clasificacion: 'A' | 'B' | 'C';
  stockMuerto: boolean;
};

type Resumen = {
  periodo: number;
  totalProductos: number;
  stockMuerto: number;
  clasificacionA: number;
  clasificacionB: number;
  clasificacionC: number;
  totalIngreso: number;
};

const CLASE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'rgba(21,101,192,0.1)', text: '#1565C0', border: 'rgba(21,101,192,0.3)' },
  B: { bg: 'rgba(5,150,105,0.1)', text: '#065F46', border: 'rgba(5,150,105,0.3)' },
  C: { bg: 'rgba(100,116,139,0.1)', text: '#475569', border: 'rgba(100,116,139,0.3)' },
};

export default function RotacionInventarioPage() {
  const [productos, setProductos] = useState<ProductoRotacion[]>([]);
  const [resumen, setResumen]     = useState<Resumen | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [periodo, setPeriodo]     = useState(90);
  const [search, setSearch]       = useState('');
  const [filtroClase, setFiltroClase]   = useState<'todos' | 'A' | 'B' | 'C'>('todos');
  const [filtroMuerto, setFiltroMuerto] = useState(false);
  const [sortBy, setSortBy] = useState<'ingresoTotal' | 'rotacionAnual' | 'diasInventario'>('ingresoTotal');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/rotacion-inventario?dias=${periodo}`);
      const json = await res.json();
      setProductos(json.data.productos ?? []);
      setResumen(json.data.resumen ?? null);
    } catch {
      setError('No se pudo cargar el análisis de rotación');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => { load(); }, [load]);

  const filtrados = productos
    .filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchClase  = filtroClase === 'todos' || p.clasificacion === filtroClase;
      const matchMuerto = !filtroMuerto || p.stockMuerto;
      return matchSearch && matchClase && matchMuerto;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const fmtCurrency = (n: number) =>
    `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtDias = (d: number) => d >= 9999 ? '∞' : `${d}d`;

  return (
    <>
      <PageHeader
        title="Rotación de Inventario"
        subtitle="Clasificación ABC y velocidad de rotación de cada producto"
      />

      {/* Stats */}
      {resumen && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 2, mb: 3 }}>
          <StatCard
            title="Clase A (alta rotación)"
            value={resumen.clasificacionA}
            subtitle="80% del ingreso"
            color="primary"
            icon={<AutoGraphIcon />}
          />
          <StatCard
            title="Clase B"
            value={resumen.clasificacionB}
            subtitle="15% del ingreso"
            color="success"
            icon={<AutoGraphIcon />}
          />
          <StatCard
            title="Clase C (baja rotación)"
            value={resumen.clasificacionC}
            subtitle="5% del ingreso"
            color="secondary"
            icon={<AutoGraphIcon />}
          />
          <StatCard
            title="Stock muerto"
            value={resumen.stockMuerto}
            subtitle={`Sin ventas en ${resumen.periodo} días`}
            color="error"
            icon={<BlockIcon />}
          />
        </Box>
      )}

      {/* ABC legend */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Clasificación ABC</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {(['A', 'B', 'C'] as const).map(c => (
            <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Clase ${c}`}
                size="small"
                sx={{
                  fontWeight: 700, fontSize: 12,
                  bgcolor: CLASE_COLOR[c].bg,
                  color: CLASE_COLOR[c].text,
                  border: `1px solid ${CLASE_COLOR[c].border}`,
                }}
              />
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {c === 'A' ? '≈80% del ingreso total' : c === 'B' ? '≈15% del ingreso total' : '≈5% del ingreso total'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar producto..."
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
            sx={{ width: 240 }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Período</InputLabel>
            <Select value={periodo} label="Período" onChange={e => setPeriodo(Number(e.target.value))}>
              <MenuItem value={30}>30 días</MenuItem>
              <MenuItem value={60}>60 días</MenuItem>
              <MenuItem value={90}>90 días</MenuItem>
              <MenuItem value={180}>180 días</MenuItem>
              <MenuItem value={365}>365 días</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            size="small"
            value={filtroClase}
            exclusive
            onChange={(_, v) => v && setFiltroClase(v)}
          >
            <ToggleButton value="todos">Todos</ToggleButton>
            <ToggleButton value="A">A</ToggleButton>
            <ToggleButton value="B">B</ToggleButton>
            <ToggleButton value="C">C</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButton
            value="muerto"
            selected={filtroMuerto}
            onChange={() => setFiltroMuerto(v => !v)}
            size="small"
            color="error"
          >
            Solo stock muerto
          </ToggleButton>

          <FormControl size="small" sx={{ minWidth: 180, ml: 'auto' }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select value={sortBy} label="Ordenar por" onChange={e => setSortBy(e.target.value as typeof sortBy)}>
              <MenuItem value="ingresoTotal">Mayor ingreso</MenuItem>
              <MenuItem value="rotacionAnual">Mayor rotación</MenuItem>
              <MenuItem value="diasInventario">Más días en almacén</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtrados.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No se encontraron productos</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Clase</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Stock</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Uds. Vendidas</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Ingreso</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Rotación anual</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Días en stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map(p => (
                  <TableRow
                    key={p.id}
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      bgcolor: p.stockMuerto ? 'rgba(239,68,68,0.03)' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'monospace' }}>{p.sku}</Typography>
                        </Box>
                        {p.stockMuerto && (
                          <Tooltip title="Sin ventas en el período analizado">
                            <Chip
                              label="Sin movimiento"
                              size="small"
                              sx={{ fontSize: 10, bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }}>{p.categoria}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`Clase ${p.clasificacion}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          bgcolor: CLASE_COLOR[p.clasificacion].bg,
                          color: CLASE_COLOR[p.clasificacion].text,
                          border: `1px solid ${CLASE_COLOR[p.clasificacion].border}`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.stock}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.unidadesVendidas}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                        {fmtCurrency(p.ingresoTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Número de veces que se renueva el stock en un año">
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                          {p.rotacionAnual > 0 ? `${p.rotacionAnual}x` : '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Días estimados para agotar el stock actual al ritmo actual de ventas">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: p.diasInventario >= 9999 ? '#EF4444' : p.diasInventario > 180 ? '#F59E0B' : 'inherit',
                          }}
                        >
                          {fmtDias(p.diasInventario)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filtrados.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {filtrados.length} productos
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              Ingreso total: {fmtCurrency(filtrados.reduce((s, p) => s + p.ingresoTotal, 0))}
            </Typography>
          </Box>
        )}
      </Paper>
    </>
  );
}
