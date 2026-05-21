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
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import type { UsuarioAdmin } from '../types';

type Props = {
  usuarios: UsuarioAdmin[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  search: string;
  estadoFilter: string;
  onSearchChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEditar: (u: UsuarioAdmin) => void;
  onToggle: (u: UsuarioAdmin) => void;
  currentUserId?: string;
};

export default function UsuariosTable({
  usuarios, loading, total, page, limit,
  search, estadoFilter,
  onSearchChange, onEstadoChange, onPageChange, onLimitChange,
  onEditar, onToggle, currentUserId,
}: Props) {
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre, usuario o email…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFilter} label="Estado" onChange={e => onEstadoChange(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="activo">Activos</MenuItem>
            <MenuItem value="inactivo">Inactivos</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell>Registrado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">Sin usuarios</Typography>
                </TableCell>
              </TableRow>
            ) : usuarios.map(u => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.nombre}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>@{u.username}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {u.roles.length === 0
                      ? <Typography variant="caption" color="text.secondary">Sin roles</Typography>
                      : u.roles.map(r => (
                          <Chip key={r.id} label={r.codigo} size="small" color="primary" variant="outlined" />
                        ))
                    }
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Chip label={u.estado ? 'Activo' : 'Inactivo'} color={u.estado ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(u.creadoEn).toLocaleDateString('es-PE')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEditar(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={u.estado ? 'Desactivar' : 'Activar'}>
                    <span>
                      <IconButton
                        size="small"
                        color={u.estado ? 'error' : 'success'}
                        onClick={() => onToggle(u)}
                        disabled={u.id === currentUserId}
                      >
                        {u.estado ? <PersonOffIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
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
