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
import BlockIcon from '@mui/icons-material/Block';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/shared/components/ui/PageHeader';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { useToast } from '@/shared/context/ToastContext';
import ConteoFormDialog from '@/modules/conteos-inventario/components/ConteoFormDialog';
import ConteoRegistrarDialog from '@/modules/conteos-inventario/components/ConteoRegistrarDialog';
import { conteosInventarioClientService } from '@/modules/conteos-inventario/services/conteos-inventario.client';
import type { Conteo, EstadoConteo, CreateConteoDto, RegistrarConteoItemDto } from '@/modules/conteos-inventario/types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<Conteo> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

const estadoLabel: Record<EstadoConteo, string> = {
  abierto: 'Abierto',
  aplicado: 'Aplicado',
  anulado: 'Anulado',
};

const estadoColor: Record<EstadoConteo, 'warning' | 'success' | 'error'> = {
  abierto: 'warning',
  aplicado: 'success',
  anulado: 'error',
};

export default function ConteosInventarioPage() {
  const showToast = useToast();
  const [result, setResult] = useState<PaginatedResponse<Conteo>>(EMPTY);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [contarTarget, setContarTarget] = useState<Conteo | null>(null);
  const [verTarget, setVerTarget] = useState<Conteo | null>(null);
  const [confirm, setConfirm] = useState<{ conteo: Conteo; accion: 'aplicar' | 'anular' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conteosInventarioClientService.getAll({ page, limit, estado: estado || undefined });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar conteos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, estado]);

  useEffect(() => { load(); }, [load]);

  const handleCrear = async (data: CreateConteoDto) => {
    setSaving(true);
    try {
      const conteo = await conteosInventarioClientService.create(data);
      showToast(`Planilla ${conteo.numero} generada con ${conteo.totalItems} producto(s)`, 'success');
      setFormOpen(false);
      await load();
      setContarTarget(conteo);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al crear conteo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarConteo = async (conteoId: string, items: RegistrarConteoItemDto[]) => {
    setProcesando(true);
    try {
      const actualizado = await conteosInventarioClientService.registrar(conteoId, items);
      showToast('Conteo guardado', 'success');
      setContarTarget(actualizado);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al guardar conteo', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const handleAccion = async () => {
    if (!confirm) return;
    setProcesando(true);
    try {
      if (confirm.accion === 'aplicar') {
        await conteosInventarioClientService.aplicar(confirm.conteo.id);
        showToast('Conteo aplicado — stock ajustado a lo contado', 'success');
      } else {
        await conteosInventarioClientService.anular(confirm.conteo.id);
        showToast('Planilla anulada', 'success');
      }
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
        title="Conteos de Inventario"
        subtitle="Conteos cíclicos y toma de inventario físico con ajuste de diferencias"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Nuevo Conteo
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
              <MenuItem value="abierto">Abierto</MenuItem>
              <MenuItem value="aplicado">Aplicado</MenuItem>
              <MenuItem value="anulado">Anulado</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Almacén</TableCell>
                <TableCell align="center">Avance</TableCell>
                <TableCell align="center">Diferencias</TableCell>
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
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : result.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      No hay conteos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{c.numero}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.almacenNombre}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${c.contados}/${c.totalItems}`}
                        size="small"
                        variant="outlined"
                        color={c.contados === c.totalItems ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {c.conDiferencia > 0 ? (
                        <Chip label={c.conDiferencia} size="small" color="warning" />
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={estadoLabel[c.estado]} color={estadoColor[c.estado]} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(c.creadoEn).toLocaleDateString('es-PE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{c.usuarioNombre}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {c.estado === 'abierto' ? (
                        <>
                          <Tooltip title="Registrar conteo físico">
                            <IconButton size="small" color="primary" onClick={() => setContarTarget(c)}>
                              <EditNoteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Aplicar diferencias al stock">
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={c.contados === 0}
                                onClick={() => setConfirm({ conteo: c, accion: 'aplicar' })}
                              >
                                <DoneAllIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Anular planilla">
                            <IconButton size="small" color="error" onClick={() => setConfirm({ conteo: c, accion: 'anular' })}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Ver detalle">
                          <IconButton size="small" color="primary" onClick={() => setVerTarget(c)}>
                            <VisibilityIcon fontSize="small" />
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

      <ConteoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCrear}
        loading={saving}
      />

      {/* Registrar conteo (editable) */}
      <ConteoRegistrarDialog
        open={!!contarTarget}
        conteo={contarTarget}
        mode="contar"
        loading={procesando}
        onGuardar={handleGuardarConteo}
        onClose={() => setContarTarget(null)}
      />

      {/* Ver detalle (solo lectura) */}
      <ConteoRegistrarDialog
        open={!!verTarget}
        conteo={verTarget}
        mode="ver"
        onClose={() => setVerTarget(null)}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.accion === 'aplicar' ? 'Aplicar conteo' : 'Anular planilla'}
        message={
          confirm?.accion === 'aplicar'
            ? `¿Aplicar el conteo "${confirm.conteo.numero}"? El stock de ${confirm.conteo.contados} producto(s) contado(s) se ajustará a lo contado físicamente (${confirm.conteo.conDiferencia} con diferencia). Esta acción genera ajustes en el kardex.`
            : `¿Anular la planilla "${confirm?.conteo.numero}"? No se aplicará ningún ajuste.`
        }
        onConfirm={handleAccion}
        onClose={() => setConfirm(null)}
        loading={procesando}
        confirmLabel={confirm?.accion === 'aplicar' ? 'Aplicar' : 'Anular'}
        confirmColor={confirm?.accion === 'aplicar' ? 'success' : 'error'}
      />
    </>
  );
}
