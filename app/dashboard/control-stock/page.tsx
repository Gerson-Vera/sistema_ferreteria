'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

type AlertaProducto = {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  codigoBarras: string | null;
};

type Data = { count: number; productos: AlertaProducto[] };

export default function ControlStockPage() {
  const [data, setData]     = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/productos/stock-bajo');
      const json = await res.json();
      setData(json.data);
    } catch {
      setError('No se pudo cargar las alertas de stock');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const agotados  = data?.productos.filter(p => p.stock === 0) ?? [];
  const bajoMin   = data?.productos.filter(p => p.stock > 0)   ?? [];

  const filtrados = (data?.productos ?? []).filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Control de Stock"
        subtitle="Productos con stock bajo o agotado que requieren atención"
      />

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard
          title="Total alertas"
          value={data?.count ?? 0}
          color="warning"
          icon={<WarningAmberIcon />}
        />
        <StatCard
          title="Sin stock"
          value={agotados.length}
          color="error"
          icon={<ReportProblemIcon />}
        />
        <StatCard
          title="Stock bajo"
          value={bajoMin.length}
          color="warning"
          icon={<WarningAmberIcon />}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {/* Search bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
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
            sx={{ width: 320 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtrados.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {search ? 'No se encontraron productos' : 'No hay productos con stock bajo'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>SKU</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Stock Actual</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Stock Mínimo</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, minWidth: 160 }}>Nivel</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map(p => {
                  const agotado = p.stock === 0;
                  const pct = p.stockMinimo > 0
                    ? Math.min((p.stock / p.stockMinimo) * 100, 100)
                    : 0;

                  return (
                    <TableRow
                      key={p.id}
                      sx={{
                        '&:hover': { bgcolor: '#F8FAFC' },
                        bgcolor: agotado ? 'rgba(239,68,68,0.04)' : 'inherit',
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</Typography>
                        {p.codigoBarras && (
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{p.codigoBarras}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{p.sku}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: agotado ? '#EF4444' : '#F59E0B',
                          }}
                        >
                          {p.stock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                          {p.stockMinimo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`${p.stock} / ${p.stockMinimo} unidades`}>
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(0,0,0,0.07)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: agotado ? '#EF4444' : '#F59E0B',
                                  borderRadius: 3,
                                },
                              }}
                            />
                            <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.3 }}>
                              {pct.toFixed(0)}% del mínimo
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={agotado ? 'Agotado' : 'Bajo mínimo'}
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: agotado ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: agotado ? '#EF4444' : '#B45309',
                            border: `1px solid ${agotado ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
}
