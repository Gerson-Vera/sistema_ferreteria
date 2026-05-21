'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/shared/components/ui/PageHeader';
import { ordenesCompraClientService } from '@/modules/ordenes-compra/services/ordenes-compra.client';
import type { OrdenCompraResumen, EstadoOrden } from '@/modules/ordenes-compra/types';

const ESTADO_META: Record<EstadoOrden, { label: string; bg: string; color: string; border: string }> = {
  borrador:  { label: 'Borrador',  bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' },
  enviada:   { label: 'Enviada',   bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8', border: 'rgba(59,130,246,0.3)' },
  recibida:  { label: 'Recibida',  bg: 'rgba(5,150,105,0.1)',   color: '#065F46', border: 'rgba(5,150,105,0.3)' },
  anulada:   { label: 'Anulada',   bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', border: 'rgba(239,68,68,0.3)' },
};

const fmt = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OrdenesCompraPage() {
  const router = useRouter();
  const [ordenes, setOrdenes]   = useState<OrdenCompraResumen[]>([]);
  const [total, setTotal]       = useState(0);
  const [page] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordenesCompraClientService.getAll({
        page,
        limit: 50,
        search: search || undefined,
        estado: filtroEstado || undefined,
      });
      setOrdenes(res.data);
      setTotal(res.total);
    } catch {
      setError('No se pudieron cargar las órdenes de compra');
    } finally {
      setLoading(false);
    }
  }, [page, search, filtroEstado]);

  useEffect(() => { load(); }, [load]);

  const fmtFecha = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <PageHeader
        title="Órdenes de Compra"
        subtitle="Pedidos a proveedores con seguimiento de estados"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/ordenes-compra/nueva')}
          >
            Nueva Orden
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {/* Filtros */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar número o proveedor..."
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
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={filtroEstado} label="Estado" onChange={e => setFiltroEstado(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {(Object.keys(ESTADO_META) as EstadoOrden[]).map(e => (
                <MenuItem key={e} value={e}>{ESTADO_META[e].label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography sx={{ ml: 'auto', fontSize: 13, color: 'text.secondary' }}>
            {total} orden{total !== 1 ? 'es' : ''}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : ordenes.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No hay órdenes de compra</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>N° Orden</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Proveedor</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Solicitado por</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Ítems</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Correo</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Creada</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenes.map(o => {
                  const meta = ESTADO_META[o.estado];
                  return (
                    <TableRow key={o.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>
                          {o.numero}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{o.proveedorNombre}</Typography>
                        {o.proveedorEmail && (
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{o.proveedorEmail}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13 }}>{o.usuarioNombre}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 600 }}>{o.totalItems}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{fmt(o.total)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={meta.label}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 11, bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {o.correoEnviado ? (
                          <Tooltip title={`Enviado ${fmtFecha(o.fechaEnvio)}`}>
                            <EmailIcon sx={{ fontSize: 17, color: '#1565C0' }} />
                          </Tooltip>
                        ) : (
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12 }}>{fmtFecha(o.creadoEn)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalle">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                            onClick={() => router.push(`/dashboard/ordenes-compra/${o.id}`)}
                            sx={{ fontSize: 11 }}
                          >
                            Ver
                          </Button>
                        </Tooltip>
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
