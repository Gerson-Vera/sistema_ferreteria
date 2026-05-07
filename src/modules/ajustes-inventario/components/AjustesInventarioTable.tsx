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
import type { AjusteInventario, EstadoAjuste } from '../types';

const estadoColor: Record<EstadoAjuste, 'default' | 'success' | 'error'> = {
  borrador: 'default',
  aplicado: 'success',
  anulado:  'error',
};

const estadoLabel: Record<EstadoAjuste, string> = {
  borrador: 'Borrador',
  aplicado: 'Aplicado',
  anulado:  'Anulado',
};

type Props = {
  ajustes: AjusteInventario[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  estadoFilter: string;
  onEstadoChange: (e: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onAplicar: (a: AjusteInventario) => void;
  onAnular: (a: AjusteInventario) => void;
};

export default function AjustesInventarioTable({
  ajustes, loading, total, page, limit,
  estadoFilter, onEstadoChange, onPageChange, onLimitChange,
  onAplicar, onAnular,
}: Props) {
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFilter} label="Estado" onChange={e => onEstadoChange(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="borrador">Borrador</MenuItem>
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
              <TableCell>Motivo</TableCell>
              <TableCell align="center">Productos</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : ajustes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No hay ajustes de inventario registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ajustes.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {a.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{a.motivo}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={a.items?.length ?? 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={estadoLabel[a.estado]}
                      color={estadoColor[a.estado]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(a.creadoEn).toLocaleDateString('es-PE')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {a.estado === 'borrador' && (
                      <Tooltip title="Aplicar ajuste">
                        <IconButton size="small" color="success" onClick={() => onAplicar(a)}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {a.estado !== 'anulado' && (
                      <Tooltip title="Anular ajuste">
                        <IconButton size="small" color="error" onClick={() => onAnular(a)}>
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
