'use client';
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Almacen } from '@/modules/almacenes/types';
import type { Categoria } from '@/modules/categorias/types';
import type { StatusFilter } from '../hooks/useProductos';
import type { Producto } from '../types';

type Props = {
  productos: Producto[];
  categorias: Categoria[];
  almacenes: Almacen[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  search: string;
  categoriaId: string;
  almacenId: string;
  status: StatusFilter;
  onSearchChange: (s: string) => void;
  onCategoriaChange: (id: string) => void;
  onAlmacenChange: (id: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onStatusChange: (s: StatusFilter) => void;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
};

export default function ProductosTable({
  productos,
  categorias,
  almacenes,
  loading,
  total,
  page,
  limit,
  search,
  categoriaId,
  almacenId,
  onSearchChange,
  onCategoriaChange,
  onAlmacenChange,
  onPageChange,
  onLimitChange,
  onStatusChange,
  status,
  onEdit,
  onDelete,
}: Props) {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => onSearchChange(inputValue), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const catMap = useMemo(
    () => new Map(categorias.map(c => [c.id, c.nombre])),
    [categorias],
  );

  const almMap = useMemo(
    () => new Map(almacenes.map(a => [a.id, a.nombre])),
    [almacenes],
  );

  const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <TextField
          placeholder="Buscar por nombre, SKU o código de barras..."
          size="small"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          sx={{ width: 280 }}
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={categoriaId}
            label="Categoría"
            onChange={e => onCategoriaChange(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {categorias.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Almacén</InputLabel>
          <Select
            value={almacenId}
            label="Almacén"
            onChange={e => onAlmacenChange(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {almacenes.map(a => (
              <MenuItem key={a.id} value={a.id}>
                {a.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={status}
          exclusive
          size="small"
          onChange={(_, val) => { if (val) onStatusChange(val); }}
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
              <TableCell sx={{ width: 56 }} />
              <TableCell>SKU</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Almacén</TableCell>
              <TableCell align="right">P. Venta</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    No se encontraron productos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productos.map(prod => {
                const lowStock = prod.stock <= prod.stockMinimo;
                return (
                  <TableRow key={prod.id} hover>
                    <TableCell sx={{ p: 0.5 }}>
                      {prod.img ? (
                        <Box
                          component="img"
                          src={prod.img}
                          alt={prod.nombre}
                          sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                        />
                      ) : (
                        <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageNotSupportedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {prod.sku.length > 8 ? prod.sku.slice(0, 8) + '…' : prod.sku}
                      </Typography>
                      {prod.codigoBarras && (
                        <Typography variant="caption" color="text.secondary">
                          {prod.codigoBarras}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {prod.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {catMap.get(prod.categoriaId) ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {prod.almacenId ? almMap.get(prod.almacenId) ?? '—' : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{fmt(prod.precioVenta)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        {lowStock && (
                          <Tooltip title={`Stock mínimo: ${prod.stockMinimo} · Requiere reposición`}>
                            <WarningAmberIcon fontSize="small" color="warning" />
                          </Tooltip>
                        )}
                        <Chip
                          label={prod.stock}
                          size="small"
                          color={lowStock ? 'warning' : 'default'}
                          variant={lowStock ? 'filled' : 'outlined'}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={prod.activo ? 'Activo' : 'Inactivo'}
                        color={prod.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(prod)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => onDelete(prod)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 25, 50]}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        labelRowsPerPage="Filas:"
      />
    </Box>
  );
}
