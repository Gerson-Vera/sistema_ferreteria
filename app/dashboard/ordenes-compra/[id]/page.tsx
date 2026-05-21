'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useToast } from '@/shared/context/ToastContext';
import { ordenesCompraClientService } from '@/modules/ordenes-compra/services/ordenes-compra.client';
import type { OrdenCompra, EstadoOrden, RecibirOrdenResult } from '@/modules/ordenes-compra/types';

const ESTADO_META: Record<EstadoOrden, { label: string; bg: string; color: string; border: string }> = {
  borrador:  { label: 'Borrador',  bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' },
  enviada:   { label: 'Enviada',   bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8', border: 'rgba(59,130,246,0.3)' },
  recibida:  { label: 'Recibida',  bg: 'rgba(5,150,105,0.1)',   color: '#065F46', border: 'rgba(5,150,105,0.3)' },
  anulada:   { label: 'Anulada',   bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', border: 'rgba(239,68,68,0.3)' },
};

const fmt = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtFecha = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function DetalleOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const showToast = useToast();

  const [orden, setOrden]           = useState<OrdenCompra | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [accionLoading, setAccion]  = useState<string | null>(null);
  const [resultado, setResultado]   = useState<RecibirOrdenResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<'enviar' | 'recibir' | 'anular' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrden(await ordenesCompraClientService.getById(id));
    } catch {
      setError('No se pudo cargar la orden de compra');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleEnviar = async () => {
    setConfirmOpen(null);
    setAccion('enviar');
    try {
      const updated = await ordenesCompraClientService.enviar(id);
      setOrden(updated);
      showToast(`Correo enviado a ${updated.proveedorEmail}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al enviar correo', 'error');
    } finally {
      setAccion(null);
    }
  };

  const handleRecibir = async () => {
    setConfirmOpen(null);
    setAccion('recibir');
    try {
      const res = await ordenesCompraClientService.recibir(id) as RecibirOrdenResult;
      setResultado(res);
      setOrden(await ordenesCompraClientService.getById(id));
      showToast('Orden recibida — inventario actualizado', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al recibir orden', 'error');
    } finally {
      setAccion(null);
    }
  };

  const handleAnular = async () => {
    setConfirmOpen(null);
    setAccion('anular');
    try {
      const updated = await ordenesCompraClientService.anular(id);
      setOrden(updated);
      showToast('Orden anulada', 'warning');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al anular', 'error');
    } finally {
      setAccion(null);
    }
  };

  if (loading) {
    return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (error || !orden) {
    return <Alert severity="error">{error ?? 'Orden no encontrada'}</Alert>;
  }

  const meta = ESTADO_META[orden.estado];
  const puedeEnviar  = orden.estado === 'borrador';
  const puedeRecibir = orden.estado === 'enviada' || orden.estado === 'borrador';
  const puedeAnular  = orden.estado !== 'recibida' && orden.estado !== 'anulada';
  const esFinal      = orden.estado === 'recibida' || orden.estado === 'anulada';

  return (
    <>
      <PageHeader
        title={orden.numero}
        subtitle={`Orden de compra — ${orden.proveedorNombre}`}
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/ordenes-compra')}>
            Volver
          </Button>
        }
      />

      {resultado && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setResultado(null)}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Inventario actualizado correctamente</Typography>
          {resultado.productosCreados > 0 && (
            <Typography variant="body2">{resultado.productosCreados} producto(s) nuevo(s) creado(s)</Typography>
          )}
          {resultado.movimientos.map((m, i) => (
            <Typography key={i} variant="body2">
              • {m.productoNombre}: +{m.cantidadAceptada} ud.
              {m.cantidadAceptada < m.cantidadOrdenada && (
                <span style={{ color: '#B45309' }}>
                  {' '}(se limitó a {m.cantidadAceptada} por stock máximo)
                </span>
              )}
              → stock final: {m.stockFinal}
            </Typography>
          ))}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Info principal */}
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Estado</Typography>
              <Chip label={meta.label} size="small" sx={{ fontWeight: 700, bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Proveedor</Typography>
              <Typography sx={{ fontWeight: 600 }}>{orden.proveedorNombre}</Typography>
              {orden.proveedorEmail && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{orden.proveedorEmail}</Typography>}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Solicitado por</Typography>
              <Typography sx={{ fontWeight: 600 }}>{orden.usuarioNombre}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Creada</Typography>
              <Typography>{fmtFecha(orden.creadoEn)}</Typography>
            </Box>
            {orden.correoEnviado && (
              <Box>
                <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Correo enviado</Typography>
                <Typography sx={{ color: '#1565C0' }}>{fmtFecha(orden.fechaEnvio)}</Typography>
              </Box>
            )}
            {orden.fechaRecepcion && (
              <Box>
                <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Recibida</Typography>
                <Typography sx={{ color: '#065F46' }}>{fmtFecha(orden.fechaRecepcion)}</Typography>
              </Box>
            )}
            {orden.observaciones && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, mb: 0.3 }}>Observaciones</Typography>
                <Typography>{orden.observaciones}</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Ítems */}
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Productos ordenados</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Tipo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Cant. Ordenada</TableCell>
                  {esFinal && <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12 }}>Cant. Recibida</TableCell>}
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Costo Unit.</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orden.items.map(item => (
                  <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{item.descripcion}</Typography>
                      {item.detalles && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{item.detalles}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }}>{item.categoriaNombre ?? '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        icon={item.esNuevoProducto ? <NewReleasesIcon /> : undefined}
                        label={item.esNuevoProducto ? 'Nuevo' : 'Existente'}
                        sx={{
                          fontSize: 10, fontWeight: 700,
                          bgcolor: item.esNuevoProducto ? 'rgba(124,58,237,0.1)' : 'rgba(5,150,105,0.1)',
                          color: item.esNuevoProducto ? '#5B21B6' : '#065F46',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600 }}>{item.cantidad}</Typography>
                    </TableCell>
                    {esFinal && (
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: item.cantidadRecibida < item.cantidad ? '#F59E0B' : '#065F46',
                          }}
                        >
                          {item.cantidadRecibida}
                          {item.cantidadRecibida < item.cantidad && (
                            <Tooltip title="Limitado por stock máximo">
                              <span style={{ marginLeft: 4, fontSize: 11, color: '#B45309' }}>⚠</span>
                            </Tooltip>
                          )}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right">{fmt(item.costoUnitario)}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700 }}>{fmt(item.subtotal)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Totales */}
          <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ minWidth: 240 }}>
              <Stack spacing={0.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{fmt(orden.subtotal)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">IGV (18%)</Typography>
                  <Typography variant="body2">{fmt(orden.igv)}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                    {fmt(orden.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Acciones */}
        {!esFinal && (
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {puedeAnular && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<BlockIcon />}
                onClick={() => setConfirmOpen('anular')}
                disabled={!!accionLoading}
              >
                Anular orden
              </Button>
            )}
            {puedeEnviar && (
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => setConfirmOpen('enviar')}
                disabled={!!accionLoading || !orden.proveedorEmail}
              >
                {accionLoading === 'enviar' ? 'Enviando...' : 'Enviar al proveedor'}
              </Button>
            )}
            {puedeRecibir && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => setConfirmOpen('recibir')}
                disabled={!!accionLoading}
              >
                {accionLoading === 'recibir' ? 'Procesando...' : 'Marcar como recibida'}
              </Button>
            )}
          </Box>
        )}
      </Stack>

      {/* Diálogos de confirmación */}
      <Dialog open={confirmOpen === 'enviar'} onClose={() => setConfirmOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Enviar orden al proveedor</DialogTitle>
        <DialogContent>
          <Typography>Se enviará un correo con la orden de compra a <strong>{orden.proveedorEmail}</strong>. ¿Continuar?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEnviar}>Enviar correo</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen === 'recibir'} onClose={() => setConfirmOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar recepción de mercancía</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>
            Al confirmar, los productos de esta orden se agregarán al inventario automáticamente.
          </Typography>
          <Alert severity="info" sx={{ fontSize: 13 }}>
            <strong>Algoritmo de recepción:</strong> Si un producto tiene stock máximo configurado, solo se aceptará la cantidad que no lo exceda. Los productos nuevos se crearán en el catálogo.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleRecibir}>Confirmar recepción</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen === 'anular'} onClose={() => setConfirmOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Anular orden de compra</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que deseas anular la orden <strong>{orden.numero}</strong>? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleAnular}>Anular</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
