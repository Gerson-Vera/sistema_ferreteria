'use client';
import Box from '@mui/material/Box';
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
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { EstadoVenta, Venta } from '../types';

const estadoColor: Record<EstadoVenta, 'warning' | 'success' | 'error'> = {
  pendiente: 'warning',
  completada: 'success',
  anulada: 'error',
};

const estadoLabel: Record<EstadoVenta, string> = {
  pendiente: 'Pendiente',
  completada: 'Completada',
  anulada: 'Anulada',
};

type Props = {
  ventas: Venta[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  estadoFilter: string;
  onEstadoChange: (e: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onAnular: (v: Venta) => void;
  onView?: (v: Venta) => void;
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

export default function VentasTable({
  ventas,
  loading,
  total,
  page,
  limit,
  estadoFilter,
  onEstadoChange,
  onPageChange,
  onLimitChange,
  onAnular,
  onView,
}: Props) {
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFilter} label="Estado" onChange={e => onEstadoChange(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="completada">Completada</MenuItem>
            <MenuItem value="anulada">Anulada</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell>
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
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No hay ventas registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ventas.map(v => (
                <TableRow key={v.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {v.numero}
                    </Typography>
                  </TableCell>

                  {/* Cliente */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {v.clienteNombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID {v.clienteId}
                    </Typography>
                  </TableCell>

                  {/* Vendedor */}
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary">
                        {v.usuarioNombre}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Chip label={v.items?.length ?? 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{fmt(v.subtotal)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">{fmt(v.igv)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(v.total)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={estadoLabel[v.estado]}
                      color={estadoColor[v.estado]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(v.creadoEn).toLocaleDateString('es-PE')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(v.creadoEn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {onView && (
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => onView(v)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {v.estado !== 'anulada' && (
                      <Tooltip title="Anular venta">
                        <IconButton size="small" color="error" onClick={() => onAnular(v)}>
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
