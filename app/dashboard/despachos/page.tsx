'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BlockIcon from '@mui/icons-material/Block';
import PageHeader from '@/shared/components/ui/PageHeader';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { useToast } from '@/shared/context/ToastContext';
import DespachoFormDialog from '@/modules/despachos/components/DespachoFormDialog';
import { despachosClientService } from '@/modules/despachos/services/despachos.client';
import type { Despacho, EstadoDespacho, CreateDespachoDto } from '@/modules/despachos/types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Despacho> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

const estadoLabel: Record<EstadoDespacho, string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  despachado: 'Despachado',
  entregado: 'Entregado',
  anulado: 'Anulado',
};

const estadoColor: Record<EstadoDespacho, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pendiente: 'default',
  en_preparacion: 'warning',
  despachado: 'info',
  entregado: 'success',
  anulado: 'error',
};

const siguienteLabel: Partial<Record<EstadoDespacho, string>> = {
  pendiente: 'Iniciar preparación',
  en_preparacion: 'Marcar despachado',
  despachado: 'Marcar entregado',
};

export default function DespachosPage() {
  const showToast = useToast();
  const [result, setResult] = useState<PaginatedResponse<Despacho>>(EMPTY);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [confirm, setConfirm] = useState<{ despacho: Despacho; accion: 'avanzar' | 'anular' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await despachosClientService.getAll({ page, limit, estado: estado || undefined });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar despachos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, estado]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data: CreateDespachoDto) => {
    setSaving(true);
    try {
      await despachosClientService.create(data);
      showToast('Despacho creado', 'success');
      setFormOpen(false);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al crear', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAccion = async () => {
    if (!confirm) return;
    setProcesando(true);
    try {
      const actualizado = await despachosClientService[confirm.accion](confirm.despacho.id);
      showToast(
        confirm.accion === 'anular' ? 'Despacho anulado' : `Despacho ${estadoLabel[actualizado.estado].toLowerCase()}`,
        'success',
      );
      setConfirm(null);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al procesar', 'error');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Despachos y Entregas"
        subtitle="Seguimiento de entregas: preparación, despacho y entrega al cliente"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Nuevo Despacho
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={estado} label="Estado" onChange={e => { setEstado(e.target.value); setPage(1); }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="en_preparacion">En preparación</MenuItem>
              <MenuItem value="despachado">Despachado</MenuItem>
              <MenuItem value="entregado">Entregado</MenuItem>
              <MenuItem value="anulado">Anulado</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Venta</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Transportista</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Entrega</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : result.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No hay despachos registrados
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
                      <Typography variant="body2" color="text.secondary">{d.ventaNumero}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{d.clienteNombre}</Typography>
                      {d.telefono && (
                        <Typography variant="caption" color="text.secondary">{d.telefono}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                        {d.direccionEntrega}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {d.transportista ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={estadoLabel[d.estado]} color={estadoColor[d.estado]} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {d.fechaEntrega
                          ? new Date(d.fechaEntrega).toLocaleDateString('es-PE')
                          : d.fechaDespacho
                            ? `Desp. ${new Date(d.fechaDespacho).toLocaleDateString('es-PE')}`
                            : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {siguienteLabel[d.estado] && (
                        <Tooltip title={siguienteLabel[d.estado]!}>
                          <IconButton size="small" color="primary" onClick={() => setConfirm({ despacho: d, accion: 'avanzar' })}>
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {d.estado !== 'entregado' && d.estado !== 'anulado' && (
                        <Tooltip title="Anular">
                          <IconButton size="small" color="error" onClick={() => setConfirm({ despacho: d, accion: 'anular' })}>
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

      <DespachoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.accion === 'anular' ? 'Anular despacho' : (confirm ? siguienteLabel[confirm.despacho.estado] ?? 'Avanzar' : '')}
        message={confirm?.accion === 'anular'
          ? `¿Anular el despacho "${confirm.despacho.numero}"?`
          : `¿Confirmas avanzar el despacho "${confirm?.despacho.numero}" (${confirm ? estadoLabel[confirm.despacho.estado] : ''} → ${confirm && siguienteLabel[confirm.despacho.estado] ? siguienteLabel[confirm.despacho.estado]!.replace('Iniciar ', '').replace('Marcar ', '') : ''})?`}
        onConfirm={handleAccion}
        onClose={() => setConfirm(null)}
        loading={procesando}
        confirmLabel={confirm?.accion === 'anular' ? 'Anular' : 'Confirmar'}
        confirmColor={confirm?.accion === 'anular' ? 'error' : 'primary'}
      />
    </>
  );
}
