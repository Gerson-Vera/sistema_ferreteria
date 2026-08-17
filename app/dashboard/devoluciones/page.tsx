'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import PageHeader from '@/shared/components/ui/PageHeader';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { useToast } from '@/shared/context/ToastContext';
import DevolucionFormDialog from '@/modules/devoluciones/components/DevolucionFormDialog';
import { devolucionesClientService } from '@/modules/devoluciones/services/devoluciones.client';
import type { Devolucion, CreateDevolucionDto, TipoDevolucion } from '@/modules/devoluciones/types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Devolucion> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
const fmt = (n: number) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

export default function DevolucionesPage() {
  const showToast = useToast();
  const [tipo, setTipo] = useState<TipoDevolucion>('venta');
  const [result, setResult] = useState<PaginatedResponse<Devolucion>>(EMPTY);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [anularTarget, setAnularTarget] = useState<Devolucion | null>(null);
  const [procesando, setProcesando] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await devolucionesClientService.getAll({ tipo, page, limit });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar devoluciones');
    } finally {
      setLoading(false);
    }
  }, [tipo, page, limit]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data: CreateDevolucionDto) => {
    setSaving(true);
    try {
      await devolucionesClientService.create(data);
      showToast(
        data.tipo === 'venta'
          ? 'Devolución registrada — stock reingresado al almacén'
          : 'Devolución registrada — stock retirado del almacén',
        'success',
      );
      setFormOpen(false);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al registrar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAnular = async () => {
    if (!anularTarget) return;
    setProcesando(true);
    try {
      await devolucionesClientService.anular(anularTarget.id, anularTarget.tipo);
      showToast('Devolución anulada — stock revertido', 'success');
      setAnularTarget(null);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al anular', 'error');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Devoluciones"
        subtitle="Devoluciones de clientes (ventas) y a proveedores (compras)"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Nueva Devolución
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs
        value={tipo}
        onChange={(_, v) => { setTipo(v); setPage(1); }}
        sx={{ mb: 2 }}
      >
        <Tab label="De Clientes (Ventas)" value="venta" />
        <Tab label="A Proveedores (Compras)" value="compra" />
      </Tabs>

      <Box>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>{tipo === 'venta' ? 'Venta' : 'Compra'}</TableCell>
                <TableCell>{tipo === 'venta' ? 'Cliente' : 'Proveedor'}</TableCell>
                <TableCell>Almacén</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : result.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No hay devoluciones registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map(d => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.numero}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{d.referenciaNumero}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{d.contraparteNombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{d.almacenNombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                        {d.motivo}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={d.items.map(i => `${i.productoNombre} × ${i.cantidad}`).join(' · ')}>
                        <Chip label={d.items.length} size="small" variant="outlined" />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(d.total)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={d.estado === 'registrada' ? 'Registrada' : 'Anulada'}
                        color={d.estado === 'registrada' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(d.creadoEn).toLocaleDateString('es-PE')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {d.estado === 'registrada' && (
                        <Tooltip title="Anular (revierte el stock)">
                          <IconButton size="small" color="error" onClick={() => setAnularTarget(d)}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={result.total}
          page={page - 1}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, p) => setPage(p + 1)}
          onRowsPerPageChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          labelRowsPerPage="Filas:"
        />
      </Box>

      <DevolucionFormDialog
        open={formOpen}
        tipo={tipo}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      />

      <ConfirmDialog
        open={!!anularTarget}
        title="Anular devolución"
        message={`¿Anular la devolución "${anularTarget?.numero}"? El movimiento de stock será revertido.`}
        onConfirm={handleAnular}
        onClose={() => setAnularTarget(null)}
        loading={procesando}
        confirmLabel="Anular"
        confirmColor="error"
      />
    </>
  );
}
