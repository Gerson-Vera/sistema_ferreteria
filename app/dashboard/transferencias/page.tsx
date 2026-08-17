'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import InventoryIcon from '@mui/icons-material/Inventory';
import BlockIcon from '@mui/icons-material/Block';
import PageHeader from '@/shared/components/ui/PageHeader';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { useToast } from '@/shared/context/ToastContext';
import TransferenciaFormDialog from '@/modules/transferencias/components/TransferenciaFormDialog';
import { transferenciasClientService } from '@/modules/transferencias/services/transferencias.client';
import type { Transferencia, EstadoTransferencia, CreateTransferenciaDto } from '@/modules/transferencias/types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Transferencia> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

const estadoLabel: Record<EstadoTransferencia, string> = {
  pendiente: 'Pendiente',
  enviada: 'En tránsito',
  recibida: 'Recibida',
  anulada: 'Anulada',
};

const estadoColor: Record<EstadoTransferencia, 'default' | 'info' | 'success' | 'error'> = {
  pendiente: 'default',
  enviada: 'info',
  recibida: 'success',
  anulada: 'error',
};

export default function TransferenciasPage() {
  const showToast = useToast();
  const [result, setResult] = useState<PaginatedResponse<Transferencia>>(EMPTY);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [confirm, setConfirm] = useState<{ transferencia: Transferencia; accion: 'enviar' | 'recibir' | 'anular' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transferenciasClientService.getAll({ page, limit, estado: estado || undefined });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar transferencias');
    } finally {
      setLoading(false);
    }
  }, [page, limit, estado]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data: CreateTransferenciaDto) => {
    setSaving(true);
    try {
      await transferenciasClientService.create(data);
      showToast('Transferencia creada', 'success');
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
      await transferenciasClientService[confirm.accion](confirm.transferencia.id);
      const msg = confirm.accion === 'enviar' ? 'Transferencia enviada — stock descontado del origen'
        : confirm.accion === 'recibir' ? 'Transferencia recibida — stock ingresado al destino'
        : 'Transferencia anulada';
      showToast(msg, 'success');
      setConfirm(null);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al procesar', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const confirmText = confirm?.accion === 'enviar'
    ? `¿Enviar la transferencia "${confirm.transferencia.numero}"? Se descontará el stock del almacén de origen.`
    : confirm?.accion === 'recibir'
      ? `¿Recibir la transferencia "${confirm?.transferencia.numero}"? Se ingresará el stock al almacén de destino.`
      : `¿Anular la transferencia "${confirm?.transferencia.numero}"?${confirm?.transferencia.estado === 'enviada' ? ' El stock en tránsito regresará al almacén de origen.' : ''}`;

  return (
    <>
      <PageHeader
        title="Transferencias entre Almacenes"
        subtitle="Movimiento de mercadería entre almacenes con control de tránsito"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Nueva Transferencia
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
              <MenuItem value="enviada">En tránsito</MenuItem>
              <MenuItem value="recibida">Recibida</MenuItem>
              <MenuItem value="anulada">Anulada</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Origen → Destino</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : result.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No hay transferencias registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map(t => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.numero}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {t.almacenOrigenNombre} → {t.almacenDestinoNombre}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t.items.map(i => `${i.productoNombre} × ${i.cantidad}`).join(' · ')}>
                        <Chip label={t.items.length} size="small" variant="outlined" />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={estadoLabel[t.estado]} color={estadoColor[t.estado]} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(t.creadoEn).toLocaleDateString('es-PE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{t.usuarioNombre}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {t.estado === 'pendiente' && (
                        <Tooltip title="Enviar (descuenta stock del origen)">
                          <IconButton size="small" color="primary" onClick={() => setConfirm({ transferencia: t, accion: 'enviar' })}>
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {t.estado === 'enviada' && (
                        <Tooltip title="Recibir (ingresa stock al destino)">
                          <IconButton size="small" color="success" onClick={() => setConfirm({ transferencia: t, accion: 'recibir' })}>
                            <InventoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(t.estado === 'pendiente' || t.estado === 'enviada') && (
                        <Tooltip title="Anular">
                          <IconButton size="small" color="error" onClick={() => setConfirm({ transferencia: t, accion: 'anular' })}>
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

      <TransferenciaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.accion === 'enviar' ? 'Enviar transferencia' : confirm?.accion === 'recibir' ? 'Recibir transferencia' : 'Anular transferencia'}
        message={confirmText}
        onConfirm={handleAccion}
        onClose={() => setConfirm(null)}
        loading={procesando}
        confirmLabel={confirm?.accion === 'enviar' ? 'Enviar' : confirm?.accion === 'recibir' ? 'Recibir' : 'Anular'}
        confirmColor={confirm?.accion === 'anular' ? 'error' : confirm?.accion === 'recibir' ? 'success' : 'primary'}
      />
    </>
  );
}
