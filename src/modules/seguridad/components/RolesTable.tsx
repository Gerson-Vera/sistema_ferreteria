'use client';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import type { RolAdmin } from '../types';

type Props = {
  roles: RolAdmin[];
  loading: boolean;
  onEditar: (r: RolAdmin) => void;
  onPermisos: (r: RolAdmin) => void;
  onToggle: (r: RolAdmin) => void;
};

export default function RolesTable({ roles, loading, onEditar, onPermisos, onToggle }: Props) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell align="center">Usuarios</TableCell>
            <TableCell align="center">Menús asignados</TableCell>
            <TableCell align="center">Estado</TableCell>
            <TableCell>Creado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
            ))
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary" variant="body2">Sin roles creados</Typography>
              </TableCell>
            </TableRow>
          ) : roles.map(r => (
            <TableRow key={r.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.codigo}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{r.descripcion}</Typography>
              </TableCell>
              <TableCell align="center">
                <Chip label={r.totalUsuarios} size="small" color={r.totalUsuarios > 0 ? 'primary' : 'default'} variant="outlined" />
              </TableCell>
              <TableCell align="center">
                <Chip label={r.menus.length} size="small" color={r.menus.length > 0 ? 'success' : 'default'} variant="outlined" />
              </TableCell>
              <TableCell align="center">
                <Chip label={r.estado ? 'Activo' : 'Inactivo'} color={r.estado ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(r.creadoEn).toLocaleDateString('es-PE')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar descripción">
                  <IconButton size="small" onClick={() => onEditar(r)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gestionar permisos de menú">
                  <IconButton size="small" color="primary" onClick={() => onPermisos(r)}>
                    <LockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={r.estado ? 'Desactivar' : 'Activar'}>
                  <IconButton size="small" color={r.estado ? 'error' : 'success'} onClick={() => onToggle(r)}>
                    {r.estado ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
