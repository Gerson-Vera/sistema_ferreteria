'use client';
import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import type { Categoria } from '../types';

type StatusFilter = 'all' | 'activo' | 'inactivo';

type Props = {
  categorias: Categoria[];
  loading: boolean;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
  onConfig: (categoria: Categoria) => void;
};

export default function CategoriasTable({ categorias, loading, onEdit, onDelete, onConfig }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('activo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filtered = useMemo(() => {
    let items = categorias;
    if (status !== 'all') items = items.filter(c => c.activo === (status === 'activo'));
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        c => c.nombre.toLowerCase().includes(s) || (c.descripcion ?? '').toLowerCase().includes(s),
      );
    }
    return items;
  }, [categorias, status, search]);

  useEffect(() => { setPage(0); }, [search, status]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar categoría..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          value={status}
          exclusive
          size="small"
          onChange={(_, val) => { if (val) setStatus(val); }}
        >
          <ToggleButton value="all">Todo</ToggleButton>
          <ToggleButton value="activo">Activo</ToggleButton>
          <ToggleButton value="inactivo">Inactivo</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell align="right">Reglas</TableCell>
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    {search ? 'No se encontraron resultados' : 'No hay categorías registradas'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(cat => (
                <TableRow key={cat.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cat.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {cat.descripcion ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cat.activo ? 'Activo' : 'Inactivo'}
                      color={cat.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(cat.creadoEn).toLocaleDateString('es-PE')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Configurar reglas de categoría">
                      <IconButton size="small" color="primary" onClick={() => onConfig(cat)}>
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => onEdit(cat)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => onDelete(cat)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        labelRowsPerPage="Filas:"
      />
    </Box>
  );
}
