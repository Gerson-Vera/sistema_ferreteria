'use client';
import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
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
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/shared/components/ui/PageHeader';
import { stockAlmacenesClientService } from '@/modules/stock-almacenes/services/stock-almacenes.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import type { StockAlmacen } from '@/modules/stock-almacenes/types';
import type { Almacen } from '@/modules/almacenes/types';
import type { PaginatedResponse } from '@/shared/types';

const EMPTY: PaginatedResponse<StockAlmacen> = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

export default function StockAlmacenesPage() {
  const [result, setResult] = useState<PaginatedResponse<StockAlmacen>>(EMPTY);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [almacenId, setAlmacenId] = useState('');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    almacenesClientService.getAll().then(setAlmacenes).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearchDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockAlmacenesClientService.getAll({
        page,
        limit,
        almacenId: almacenId || undefined,
        search: searchDebounced || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el stock');
    } finally {
      setLoading(false);
    }
  }, [page, limit, almacenId, searchDebounced]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader
        title="Stock por Almacén"
        subtitle="Existencias de cada producto en cada almacén"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre, SKU o código de barras"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 320 }}
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
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Almacén</InputLabel>
            <Select
              value={almacenId}
              label="Almacén"
              onChange={e => { setAlmacenId(e.target.value); setPage(1); }}
            >
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
                <TableCell>Producto</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Almacén</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Reservado</TableCell>
                <TableCell align="right">Disponible</TableCell>
                <TableCell align="right">Costo Prom.</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Actualizado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : result.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      Sin registros de stock
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {s.productoNombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {s.productoSku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{s.almacenNombre}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={s.stock}
                        size="small"
                        variant="outlined"
                        color={s.stock <= 0 ? 'error' : s.stock <= s.stockMinimo ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={s.stockReservado > 0 ? 'warning.main' : 'text.secondary'}>
                        {s.stockReservado}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.disponible}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {s.costoPromedio.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.valor.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(s.actualizadoEn).toLocaleDateString('es-PE')}
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
    </>
  );
}
