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

// ─── Paleta consistente con ERP light ────────────────────────────────────────
const C = {
  headerBg:   '#F8FAFC',
  headerText: '#64748B',
  border:     '#E8EDF3',
  rowHover:   '#FAFBFC',
  textMain:   '#1E293B',
  textMuted:  '#94A3B8',
} as const;

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

// ─── Celda de header ─────────────────────────────────────────────────────────
function TH({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <TableCell
      align={align}
      sx={{
        bgcolor: C.headerBg,
        color: C.headerText,
        fontWeight: 700,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        borderBottom: `1px solid ${C.border}`,
        py: 1.5,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </TableCell>
  );
}

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

  const catMap = useMemo(() => new Map(categorias.map(c => [c.id, c.nombre])), [categorias]);
  const almMap = useMemo(() => new Map(almacenes.map(a => [a.id, a.nombre])), [almacenes]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

  return (
    <Box>

      {/* ── Barra de filtros ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          px: 2,
          py: 1.5,
          mb: 2,
          border: `1px solid ${C.border}`,
          borderRadius: '10px',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Buscador */}
        <TextField
          placeholder="Buscar por nombre, SKU o código…"
          size="small"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          sx={{
            width: 290,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: 13.5,
              bgcolor: C.headerBg,
              '& fieldset': { borderColor: C.border },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: C.textMuted }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Categoría */}
        <FormControl
          size="small"
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: 13.5,
              bgcolor: C.headerBg,
              '& fieldset': { borderColor: C.border },
            },
          }}
        >
          <InputLabel sx={{ fontSize: 13.5 }}>Categoría</InputLabel>
          <Select
            value={categoriaId}
            label="Categoría"
            onChange={e => onCategoriaChange(e.target.value)}
          >
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todas</MenuItem>
            {categorias.map(c => (
              <MenuItem key={c.id} value={c.id} sx={{ fontSize: 13.5 }}>{c.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Almacén */}
        <FormControl
          size="small"
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: 13.5,
              bgcolor: C.headerBg,
              '& fieldset': { borderColor: C.border },
            },
          }}
        >
          <InputLabel sx={{ fontSize: 13.5 }}>Almacén</InputLabel>
          <Select
            value={almacenId}
            label="Almacén"
            onChange={e => onAlmacenChange(e.target.value)}
          >
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {almacenes.map(a => (
              <MenuItem key={a.id} value={a.id} sx={{ fontSize: 13.5 }}>{a.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status toggle */}
        <ToggleButtonGroup
          value={status}
          exclusive
          size="small"
          onChange={(_, val) => { if (val) onStatusChange(val); }}
          sx={{
            ml: 'auto',
            '& .MuiToggleButton-root': {
              px: 1.75,
              py: 0.6,
              fontSize: 12.5,
              fontWeight: 500,
              color: C.headerText,
              border: `1px solid ${C.border}`,
              borderRadius: '8px !important',
              mx: 0.25,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: '#1565C0',
                color: '#fff',
                borderColor: '#1565C0',
                '&:hover': { bgcolor: '#0D47A1' },
              },
              '&:hover': { bgcolor: C.headerBg },
            },
            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: '8px !important',
              border: `1px solid ${C.border} !important`,
            },
          }}
        >
          <ToggleButton value="all">Todos</ToggleButton>
          <ToggleButton value="activo">Activos</ToggleButton>
          <ToggleButton value="inactivo">Inactivos</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${C.border}`,
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera de la tabla con contador */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${C.border}`,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.textMain }}>
            Catálogo de Productos
          </Typography>
          <Chip
            label={`${total} ${total === 1 ? 'producto' : 'productos'}`}
            size="small"
            sx={{
              fontSize: 11.5,
              fontWeight: 600,
              bgcolor: 'rgba(21,101,192,0.08)',
              color: '#1565C0',
              border: 'none',
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TH />
                <TH>SKU</TH>
                <TH>Producto</TH>
                <TH>Categoría</TH>
                <TH>Almacén</TH>
                <TH align="right">Precio Venta</TH>
                <TH align="center">Stock</TH>
                <TH align="center">Estado</TH>
                <TH align="right">Acciones</TH>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* ── Skeleton ───────────────────────────────────────── */}
              {loading && Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ py: 1 }}>
                    <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: '8px' }} />
                  </TableCell>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton height={18} sx={{ borderRadius: '4px' }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* ── Vacío ──────────────────────────────────────────── */}
              {!loading && productos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 8, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <ImageNotSupportedIcon sx={{ fontSize: 40, color: C.textMuted }} />
                      <Typography sx={{ color: C.textMuted, fontSize: 14 }}>
                        No se encontraron productos
                      </Typography>
                      <Typography sx={{ color: C.textMuted, fontSize: 12.5 }}>
                        Intenta ajustar los filtros de búsqueda
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {/* ── Filas ──────────────────────────────────────────── */}
              {!loading && productos.map(prod => {
                const lowStock = prod.stock <= prod.stockMinimo;
                const stockPct = prod.stockMinimo > 0
                  ? Math.min(100, Math.round((prod.stock / prod.stockMinimo) * 100))
                  : 100;

                return (
                  <TableRow
                    key={prod.id}
                    sx={{
                      '&:hover': { bgcolor: C.rowHover },
                      '& td': { borderColor: C.border },
                      transition: 'background-color 0.1s',
                    }}
                  >
                    {/* Imagen */}
                    <TableCell sx={{ py: 1, px: 1.5, width: 64 }}>
                      {prod.img ? (
                        <Box
                          component="img"
                          src={prod.img}
                          alt={prod.nombre}
                          sx={{
                            width: 46,
                            height: 46,
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`,
                            display: 'block',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: '8px',
                            border: `1px dashed ${C.border}`,
                            bgcolor: C.headerBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ImageNotSupportedIcon sx={{ fontSize: 18, color: C.textMuted }} />
                        </Box>
                      )}
                    </TableCell>

                    {/* SKU */}
                    <TableCell sx={{ py: 1 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 0.75,
                          py: 0.3,
                          borderRadius: '5px',
                          bgcolor: C.headerBg,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: '#1565C0',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {prod.sku}
                        </Typography>
                      </Box>
                      {prod.codigoBarras && (
                        <Typography
                          sx={{ display: 'block', fontSize: 10.5, color: C.textMuted, mt: 0.25, fontFamily: 'monospace' }}
                        >
                          {prod.codigoBarras}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Nombre */}
                    <TableCell sx={{ py: 1 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: C.textMain }}>
                        {prod.nombre}
                      </Typography>
                    </TableCell>

                    {/* Categoría */}
                    <TableCell sx={{ py: 1 }}>
                      <Typography sx={{ fontSize: 13, color: '#475569' }}>
                        {catMap.get(prod.categoriaId) ?? '—'}
                      </Typography>
                    </TableCell>

                    {/* Almacén */}
                    <TableCell sx={{ py: 1 }}>
                      <Typography sx={{ fontSize: 13, color: '#475569' }}>
                        {prod.almacenId ? almMap.get(prod.almacenId) ?? '—' : '—'}
                      </Typography>
                    </TableCell>

                    {/* Precio venta */}
                    <TableCell align="right" sx={{ py: 1 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: C.textMain }}>
                        {fmt(prod.precioVenta)}
                      </Typography>
                    </TableCell>

                    {/* Stock */}
                    <TableCell align="center" sx={{ py: 1, minWidth: 90 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {lowStock && (
                            <Tooltip title={`Stock mínimo: ${prod.stockMinimo}`}>
                              <WarningAmberIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                            </Tooltip>
                          )}
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: prod.stock === 0
                                ? '#EF4444'
                                : lowStock
                                  ? '#F59E0B'
                                  : '#1E293B',
                            }}
                          >
                            {prod.stock}
                          </Typography>
                        </Box>
                        {/* Mini barra de stock */}
                        <Box
                          sx={{
                            width: 52,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: C.border,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${stockPct}%`,
                              height: '100%',
                              borderRadius: 2,
                              bgcolor: prod.stock === 0
                                ? '#EF4444'
                                : lowStock
                                  ? '#F59E0B'
                                  : '#22C55E',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: 10, color: C.textMuted, lineHeight: 1 }}>
                          mín {prod.stockMinimo}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Estado */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.35,
                          borderRadius: '20px',
                          bgcolor: prod.activo
                            ? 'rgba(34,197,94,0.1)'
                            : 'rgba(148,163,184,0.12)',
                          border: `1px solid ${prod.activo ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.25)'}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: prod.activo ? '#16A34A' : C.textMuted,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: prod.activo ? '#15803D' : C.textMuted,
                          }}
                        >
                          {prod.activo ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Editar producto" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(prod)}
                            sx={{
                              width: 32,
                              height: 32,
                              color: '#1565C0',
                              bgcolor: 'rgba(21,101,192,0.07)',
                              borderRadius: '8px',
                              '&:hover': { bgcolor: 'rgba(21,101,192,0.15)' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar producto" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(prod)}
                            sx={{
                              width: 32,
                              height: 32,
                              color: '#DC2626',
                              bgcolor: 'rgba(220,38,38,0.07)',
                              borderRadius: '8px',
                              '&:hover': { bgcolor: 'rgba(220,38,38,0.15)' },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Paginación ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            borderTop: `1px solid ${C.border}`,
            bgcolor: C.headerBg,
            px: 1,
          }}
        >
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            rowsPerPage={limit}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, p) => onPageChange(p + 1)}
            onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count} registros`}
            labelRowsPerPage="Filas por página:"
            sx={{
              '& .MuiTablePagination-toolbar': { minHeight: 48 },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: 12.5,
                color: C.headerText,
              },
              '& .MuiTablePagination-select': { fontSize: 12.5 },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
