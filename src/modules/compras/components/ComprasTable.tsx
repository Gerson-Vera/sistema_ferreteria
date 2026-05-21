'use client';
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
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Compra, EstadoCompra } from '../types';

const estadoColor: Record<EstadoCompra, 'warning' | 'success' | 'error'> = {
  pendiente: 'warning',
  recibida: 'success',
  anulada: 'error',
};

const estadoLabel: Record<EstadoCompra, string> = {
  pendiente: 'Pendiente',
  recibida: 'Recibida',
  anulada: 'Anulada',
};

type Props = {
  compras: Compra[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  estadoFilter: string;
  onEstadoChange: (e: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onVer: (c: Compra) => void;
  onRecibir: (c: Compra) => void;
  onAnular: (c: Compra) => void;
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

export default function ComprasTable({
  compras,
  loading,
  total,
  page,
  limit,
  estadoFilter,
  onEstadoChange,
  onPageChange,
  onLimitChange,
  onVer,
  onRecibir,
  onAnular,
}: Props) {
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFilter} label="Estado" onChange={e => onEstadoChange(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
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
              <TableCell>Proveedor</TableCell>
              <TableCell>N° Factura</TableCell>
              <TableCell align="center">Items</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right">IGV</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
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
            ) : compras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No hay compras registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              compras.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {c.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.proveedorNombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {c.numeroFactura ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={c.items?.length ?? 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{fmt(c.subtotal)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">{fmt(c.igv)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(c.total)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={estadoLabel[c.estado]}
                      color={estadoColor[c.estado]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(c.creadoEn).toLocaleDateString('es-PE')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" color="primary" onClick={() => onVer(c)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {c.estado === 'pendiente' && (
                      <Tooltip title="Marcar recibida">
                        <IconButton size="small" color="success" onClick={() => onRecibir(c)}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {c.estado !== 'anulada' && (
                      <Tooltip title="Anular compra">
                        <IconButton size="small" color="error" onClick={() => onAnular(c)}>
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
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        labelRowsPerPage="Filas:"
      />
    </Box>
  );
}
