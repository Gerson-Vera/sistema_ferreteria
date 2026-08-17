'use client';
import Box from '@mui/material/Box';
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
import Typography from '@mui/material/Typography';
import type { MovimientoInventario, TipoMovimiento } from '../types';

const tipoLabel: Record<TipoMovimiento, string> = {
  entrada_compra:  'Entrada Compra',
  salida_venta:    'Salida Venta',
  entrada_ajuste:  'Entrada Ajuste',
  salida_ajuste:   'Salida Ajuste',
  entrada_manual:  'Entrada Manual',
  salida_manual:   'Salida Manual',
  entrada_transferencia: 'Entrada Transferencia',
  salida_transferencia:  'Salida Transferencia',
  entrada_devolucion_venta: 'Devolución Venta',
  salida_devolucion_compra: 'Devolución Compra',
};

const tipoColor: Record<TipoMovimiento, 'success' | 'error' | 'info' | 'warning'> = {
  entrada_compra:  'success',
  salida_venta:    'error',
  entrada_ajuste:  'info',
  salida_ajuste:   'warning',
  entrada_manual:  'success',
  salida_manual:   'error',
  entrada_transferencia: 'info',
  salida_transferencia:  'warning',
  entrada_devolucion_venta: 'success',
  salida_devolucion_compra: 'error',
};

const fmtMoneda = (n: number) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

type AlmacenOption = { id: string; nombre: string };

type Props = {
  movimientos: MovimientoInventario[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  tipoFilter: string;
  almacenFilter: string;
  almacenes: AlmacenOption[];
  onTipoChange: (t: string) => void;
  onAlmacenChange: (a: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function MovimientosTable({
  movimientos, loading, total, page, limit,
  tipoFilter, almacenFilter, almacenes,
  onTipoChange, onAlmacenChange, onPageChange, onLimitChange,
}: Props) {
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={tipoFilter} label="Tipo" onChange={e => onTipoChange(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="entrada_compra">Entrada Compra</MenuItem>
            <MenuItem value="salida_venta">Salida Venta</MenuItem>
            <MenuItem value="entrada_ajuste">Entrada Ajuste</MenuItem>
            <MenuItem value="salida_ajuste">Salida Ajuste</MenuItem>
            <MenuItem value="entrada_manual">Entrada Manual</MenuItem>
            <MenuItem value="salida_manual">Salida Manual</MenuItem>
            <MenuItem value="entrada_transferencia">Entrada Transferencia</MenuItem>
            <MenuItem value="salida_transferencia">Salida Transferencia</MenuItem>
            <MenuItem value="entrada_devolucion_venta">Devolución Venta</MenuItem>
            <MenuItem value="salida_devolucion_compra">Devolución Compra</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Almacén</InputLabel>
          <Select value={almacenFilter} label="Almacén" onChange={e => onAlmacenChange(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {almacenes.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Almacén</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Costo Unit.</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="right">Stock Anterior</TableCell>
              <TableCell align="right">Stock Nuevo</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Observación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 11 }).map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : movimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No hay movimientos registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              movimientos.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(m.creadoEn).toLocaleDateString('es-PE')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {m.productoNombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {m.almacenNombre ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={tipoLabel[m.tipo]}
                      color={tipoColor[m.tipo]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {m.cantidad}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {m.costoUnitario !== null ? fmtMoneda(m.costoUnitario) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {m.costoUnitario !== null ? fmtMoneda(m.costoUnitario * m.cantidad) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">{m.stockAnterior}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{m.stockNuevo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {m.referenciaTipo ? `${m.referenciaTipo} #${m.referenciaId}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {m.observacion ?? '—'}
                    </Typography>
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
