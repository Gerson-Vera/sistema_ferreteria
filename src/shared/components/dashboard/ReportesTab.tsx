'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Alert from '@mui/material/Alert';
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { getReportesForRol, type ReporteDefinition, type ReporteKey } from '@/lib/dashboard/roleConfig';
import { getIcon } from './icons';

// ─── Card style ───────────────────────────────────────────────────────────────
const card = {
  background: '#FFFFFF',
  border: '1px solid rgba(44,62,80,0.09)',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(44,62,80,0.05)',
} as const;

// ─── Estado chip ─────────────────────────────────────────────────────────────
const ESTADO_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  completada: { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Completada' },
  recibida:   { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Recibida'   },
  activo:     { bg: 'rgba(39,174,96,0.12)',   color: '#27AE60', label: 'Activo'     },
  pendiente:  { bg: 'rgba(243,156,18,0.12)',  color: '#F39C12', label: 'Pendiente'  },
  anulada:    { bg: 'rgba(231,76,60,0.12)',   color: '#E74C3C', label: 'Anulada'    },
  anulado:    { bg: 'rgba(231,76,60,0.12)',   color: '#E74C3C', label: 'Anulado'    },
  inactivo:   { bg: 'rgba(149,165,166,0.15)', color: '#7F8C8D', label: 'Inactivo'  },
};

function EstadoChip({ valor }: { valor: unknown }) {
  const str = String(valor).toLowerCase();
  const cfg = ESTADO_COLOR[str];
  if (!cfg) return <Typography sx={{ fontSize: 12 }}>{String(valor)}</Typography>;
  return (
    <Box sx={{ display: 'inline-flex', px: 1, py: 0.25, borderRadius: '5px', bgcolor: cfg.bg }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: cfg.color, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
        {cfg.label}
      </Typography>
    </Box>
  );
}

function TipoMovChip({ valor }: { valor: unknown }) {
  const str = String(valor);
  const isEntrada = str.startsWith('entrada');
  const labels: Record<string, string> = {
    entrada_compra: 'Entrada Compra', salida_venta: 'Salida Venta',
    entrada_ajuste: 'Entrada Ajuste', salida_ajuste: 'Salida Ajuste',
    entrada_manual: 'Entrada Manual', salida_manual: 'Salida Manual',
  };
  return (
    <Box sx={{
      display: 'inline-flex', px: 1, py: 0.25, borderRadius: '5px',
      bgcolor: isEntrada ? 'rgba(39,174,96,0.12)' : 'rgba(231,76,60,0.12)',
    }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, monospace)', color: isEntrada ? '#27AE60' : '#E74C3C' }}>
        {labels[str] ?? str}
      </Typography>
    </Box>
  );
}

// ─── Column definitions per report key ───────────────────────────────────────
type Col = {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (v: unknown) => React.ReactNode;
  minWidth?: number;
};

const fmtFecha = (v: unknown) => new Date(v as string).toLocaleDateString('es-PE');
const fmtSoles = (v: unknown) => `S/ ${(v as number).toFixed(2)}`;
const fmtNull  = (v: unknown) => (v as string | null) ?? '—';
const fmtBool  = (v: unknown) => <EstadoChip valor={(v as boolean) ? 'activo' : 'inactivo'} />;

const COLS: Record<ReporteKey, Col[]> = {
  ventas: [
    { key: 'numero',   label: 'N° Venta',  minWidth: 110 },
    { key: 'fecha',    label: 'Fecha',     render: fmtFecha, minWidth: 100 },
    { key: 'cliente',  label: 'Cliente',   minWidth: 180 },
    { key: 'usuario',  label: 'Vendedor',  minWidth: 130 },
    { key: 'subtotal', label: 'Subtotal',  align: 'right', render: fmtSoles, minWidth: 110 },
    { key: 'igv',      label: 'IGV',       align: 'right', render: fmtSoles, minWidth: 90  },
    { key: 'total',    label: 'Total',     align: 'right', render: fmtSoles, minWidth: 110 },
    { key: 'tipoPago', label: 'Pago',      render: fmtNull, minWidth: 100 },
    { key: 'estado',   label: 'Estado',    render: v => <EstadoChip valor={v} />, minWidth: 110 },
  ],
  compras: [
    { key: 'numero',        label: 'N° Compra',  minWidth: 120 },
    { key: 'fecha',         label: 'Fecha',      render: fmtFecha, minWidth: 100 },
    { key: 'proveedor',     label: 'Proveedor',  minWidth: 180 },
    { key: 'usuario',       label: 'Usuario',    minWidth: 130 },
    { key: 'numeroFactura', label: 'Factura',    render: fmtNull, minWidth: 110 },
    { key: 'subtotal',      label: 'Subtotal',   align: 'right', render: fmtSoles, minWidth: 110 },
    { key: 'igv',           label: 'IGV',        align: 'right', render: fmtSoles, minWidth: 90  },
    { key: 'total',         label: 'Total',      align: 'right', render: fmtSoles, minWidth: 110 },
    { key: 'tipoPago',      label: 'Pago',       render: fmtNull, minWidth: 100 },
    { key: 'estado',        label: 'Estado',     render: v => <EstadoChip valor={v} />, minWidth: 100 },
  ],
  inventario: [
    { key: 'codigo',       label: 'Código',       minWidth: 100 },
    { key: 'descripcion',  label: 'Descripción',  minWidth: 240 },
    { key: 'categoria',    label: 'Categoría',    minWidth: 110 },
    { key: 'marca',        label: 'Marca',        render: fmtNull, minWidth: 100 },
    { key: 'unidad',       label: 'Unidad',       render: fmtNull, minWidth: 80  },
    { key: 'stock',        label: 'Stock',        align: 'right', minWidth: 80  },
    { key: 'stockMinimo',  label: 'Mín.',         align: 'right', minWidth: 70  },
    { key: 'stockMaximo',  label: 'Máx.',         align: 'right', minWidth: 70  },
    { key: 'precioCompra', label: 'P. Compra',    align: 'right', render: fmtSoles, minWidth: 100 },
    { key: 'precioVenta',  label: 'P. Venta',     align: 'right', render: fmtSoles, minWidth: 100 },
    { key: 'estado',       label: 'Estado',       render: fmtBool, minWidth: 90  },
  ],
  clientes: [
    { key: 'codigo',          label: 'Código',        minWidth: 90  },
    { key: 'descripcion',     label: 'Nombre/Razón',  minWidth: 220 },
    { key: 'tipo',            label: 'Tipo',          minWidth: 90  },
    { key: 'tipoDocumento',   label: 'Tipo Doc.',     minWidth: 90  },
    { key: 'numeroDocumento', label: 'N° Documento',  minWidth: 130 },
    { key: 'email',           label: 'Email',         render: fmtNull, minWidth: 170 },
    { key: 'telefono',        label: 'Teléfono',      render: fmtNull, minWidth: 110 },
    { key: 'estado',          label: 'Estado',        render: fmtBool, minWidth: 90  },
  ],
  movimientos: [
    { key: 'fecha',         label: 'Fecha',         render: fmtFecha, minWidth: 100 },
    { key: 'codigoProducto',label: 'Código',        minWidth: 100 },
    { key: 'producto',      label: 'Producto',      minWidth: 220 },
    { key: 'tipo',          label: 'Tipo',          render: v => <TipoMovChip valor={v} />, minWidth: 140 },
    { key: 'cantidad',      label: 'Cantidad',      align: 'right', minWidth: 90  },
    { key: 'stockAnterior', label: 'Stock Ant.',    align: 'right', minWidth: 100 },
    { key: 'stockNuevo',    label: 'Stock Nuevo',   align: 'right', minWidth: 110 },
    { key: 'usuario',       label: 'Usuario',       minWidth: 130 },
    { key: 'observacion',   label: 'Observación',   render: fmtNull, minWidth: 160 },
  ],
};

const STATUS_OPTIONS: Record<ReporteKey, { label: string; value: string }[]> = {
  ventas:      [{ label: 'Todos', value: 'todos' }, { label: 'Pendiente', value: 'pendiente' }, { label: 'Completada', value: 'completada' }, { label: 'Anulada', value: 'anulada' }],
  compras:     [{ label: 'Todos', value: 'todos' }, { label: 'Pendiente', value: 'pendiente' }, { label: 'Recibida',   value: 'recibida'   }, { label: 'Anulada', value: 'anulada' }],
  inventario:  [{ label: 'Todos', value: 'todos' }, { label: 'Activo',    value: 'activo'    }, { label: 'Inactivo',  value: 'inactivo'   }],
  clientes:    [{ label: 'Todos', value: 'todos' }, { label: 'Activo',    value: 'activo'    }, { label: 'Inactivo',  value: 'inactivo'   }],
  movimientos: [{ label: 'Todos', value: 'todos' }, { label: 'Entradas',  value: 'entrada'   }, { label: 'Salidas',   value: 'salida'     }],
};

const SEARCH_PH: Record<ReporteKey, string> = {
  ventas:      'Buscar por N° venta o cliente…',
  compras:     'Buscar por N° compra o proveedor…',
  inventario:  'Buscar por código o descripción…',
  clientes:    'Buscar por nombre, código o documento…',
  movimientos: 'Buscar por producto o código…',
};

const HAS_DATE: Record<ReporteKey, boolean> = {
  ventas: true, compras: true, inventario: true, clientes: true, movimientos: true,
};

// ─── Inline report viewer ─────────────────────────────────────────────────────
function ReporteViewer({
  reporte,
  onBack,
}: {
  reporte: ReporteDefinition;
  onBack: () => void;
}) {
  const key = reporte.key;
  const cols = COLS[key];
  const statusOptions = STATUS_OPTIONS[key];

  const [page, setPage]         = useState(1);
  const limit                   = 20;
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [status, setStatus]     = useState('todos');
  const [loading, setLoading]   = useState(false);
  const [rows, setRows]         = useState<Record<string, unknown>[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = (v: string) => {
    setSearchInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 450);
  };

  const buildUrl = useCallback((extra?: Record<string, string>) => {
    const url = new URL(`/api/reportes/${key}`, window.location.origin);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));
    if (search)   url.searchParams.set('search',   search);
    if (dateFrom) url.searchParams.set('dateFrom', dateFrom);
    if (dateTo)   url.searchParams.set('dateTo',   dateTo);
    if (status !== 'todos') url.searchParams.set('status', status);
    if (extra) Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  }, [key, page, search, dateFrom, dateTo, status]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(buildUrl())
      .then(r => r.json())
      .then(res => {
        setRows(res.data?.data ?? []);
        setTotal(res.data?.total ?? 0);
        setTotalPages(res.data?.totalPages ?? 1);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [buildUrl]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = buildUrl({ export: 'excel', limit: '5000', page: '1' });
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte-${key}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setExporting(false);
    }
  };

  const handleFilter = () => { setPage(1); };

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, bgcolor: '#ECF0F1', minHeight: '60vh' }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton
          onClick={onBack}
          size="small"
          sx={{
            bgcolor: '#FFFFFF', border: '1px solid rgba(44,62,80,0.12)',
            borderRadius: '8px', '&:hover': { bgcolor: '#F4F6F7' },
          }}
        >
          <ArrowLeftIcon style={{ width: 18, height: 18, color: '#2C3E50' }} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: 'var(--font-barlow, Geist, sans-serif)', fontSize: { xs: 20, md: 26 }, fontWeight: 700, color: '#2C3E50', lineHeight: 1.2 }}>
            {reporte.nombre}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#95A5A6', mt: 0.25 }}>
            {reporte.descripcion}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleExport}
          disabled={exporting || loading}
          startIcon={<TableCellsIcon style={{ width: 16, height: 16 }} />}
          sx={{
            bgcolor: '#27AE60', color: '#FFFFFF', fontWeight: 600, fontSize: 12.5,
            borderRadius: '8px', textTransform: 'none', boxShadow: 'none',
            '&:hover': { bgcolor: '#219a52', boxShadow: 'none' },
            '&:disabled': { bgcolor: 'rgba(39,174,96,0.4)', color: '#fff' },
          }}
        >
          {exporting ? 'Exportando…' : 'Exportar Excel'}
        </Button>
      </Box>

      {/* ── Filters ── */}
      <Box
        sx={{
          ...card,
          p: 2,
          mb: 2.5,
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#95A5A6', flexShrink: 0 }}>
          <FunnelIcon style={{ width: 15, height: 15 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Filtros
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder={SEARCH_PH[key]}
          value={searchInput}
          onChange={e => handleSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <MagnifyingGlassIcon style={{ width: 15, height: 15, color: '#95A5A6', marginRight: 6 }} />,
            },
          }}
          sx={{ flex: '1 1 220px', '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
        />

        {/* Date from */}
        {HAS_DATE[key] && (
          <TextField
            size="small" type="date" label="Desde"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
          />
        )}

        {/* Date to */}
        {HAS_DATE[key] && (
          <TextField
            size="small" type="date" label="Hasta"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
          />
        )}

        {/* Status */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ fontSize: 13 }}>Estado</InputLabel>
          <Select
            label="Estado"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            sx={{ borderRadius: '8px', fontSize: 13 }}
          >
            {statusOptions.map(o => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear filters */}
        {(search || dateFrom || dateTo || status !== 'todos') && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => { setSearchInput(''); setSearch(''); setDateFrom(''); setDateTo(''); setStatus('todos'); setPage(1); }}
            sx={{ borderRadius: '8px', fontSize: 12, textTransform: 'none', borderColor: 'rgba(44,62,80,0.2)', color: '#95A5A6', '&:hover': { borderColor: '#E74C3C', color: '#E74C3C', bgcolor: 'rgba(231,76,60,0.06)' } }}
          >
            Limpiar
          </Button>
        )}
      </Box>

      {/* ── Summary ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
        <Typography sx={{ fontSize: 12.5, color: '#95A5A6' }}>
          {loading ? 'Cargando…' : `${total.toLocaleString()} registro${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#BDC3C7', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
          Página {page} / {totalPages}
        </Typography>
      </Box>

      {/* ── Error ── */}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {/* ── Table ── */}
      <Box sx={{ ...card, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {cols.map(col => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? 'left'}
                    sx={{
                      fontFamily: 'var(--font-jetbrains-mono, monospace)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#7F8C8D',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      bgcolor: '#F4F6F7',
                      borderBottom: '1px solid rgba(44,62,80,0.1)',
                      whiteSpace: 'nowrap',
                      minWidth: col.minWidth,
                      py: 1.25,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {cols.map(col => (
                        <TableCell key={col.key}>
                          <Skeleton variant="text" width="80%" height={18} sx={{ bgcolor: 'rgba(44,62,80,0.06)' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={cols.length} sx={{ py: 6, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <ExclamationCircleIcon style={{ width: 40, height: 40, color: '#BDC3C7' }} />
                          <Typography sx={{ fontSize: 14, color: '#95A5A6', fontWeight: 600 }}>Sin resultados</Typography>
                          <Typography sx={{ fontSize: 12.5, color: '#BDC3C7' }}>
                            Ajusta los filtros para encontrar registros
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                : rows.map((row, idx) => (
                    <TableRow
                      key={String(row.id ?? idx)}
                      sx={{
                        '&:hover': { bgcolor: 'rgba(243,156,18,0.04)' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      {cols.map(col => (
                        <TableCell
                          key={col.key}
                          align={col.align ?? 'left'}
                          sx={{
                            fontSize: 12.5,
                            color: '#2C3E50',
                            py: 1,
                            borderBottom: '1px solid rgba(44,62,80,0.06)',
                            whiteSpace: col.key === 'descripcion' || col.key === 'observacion' ? 'normal' : 'nowrap',
                            maxWidth: col.key === 'descripcion' ? 280 : col.key === 'observacion' ? 200 : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {col.render ? col.render(row[col.key]) : String(row[col.key] ?? '—')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            shape="rounded"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: 13,
                borderRadius: '8px',
                color: '#2C3E50',
                '&.Mui-selected': { bgcolor: '#F39C12', color: '#fff', fontWeight: 700 },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

// ─── Report card ──────────────────────────────────────────────────────────────
function ReporteCard({
  reporte,
  onSelect,
}: {
  reporte: ReporteDefinition;
  onSelect: (r: ReporteDefinition) => void;
}) {
  const Icon   = getIcon(reporte.icon);
  const hasPdf = reporte.formatos.includes('PDF');
  const hasXls = reporte.formatos.includes('Excel');

  return (
    <Box
      sx={{
        ...card,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'all 0.24s ease',
        '&:hover': {
          border: '1px solid rgba(243,156,18,0.35)',
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(243,156,18,0.12)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
            bgcolor: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 20, height: 20, color: '#F39C12' }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: 'var(--font-barlow, Geist, sans-serif)', fontSize: 15, fontWeight: 700, color: '#2C3E50', mb: 0.3 }}>
            {reporte.nombre}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#95A5A6', lineHeight: 1.5 }}>
            {reporte.descripcion}
          </Typography>
        </Box>
      </Box>

      {/* Format badges */}
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {reporte.formatos.map(f => (
          <Box
            key={f}
            sx={{
              px: 1, py: 0.3, borderRadius: '5px',
              bgcolor: f === 'PDF' ? 'rgba(231,76,60,0.1)' : 'rgba(39,174,96,0.1)',
              border: `1px solid ${f === 'PDF' ? 'rgba(231,76,60,0.3)' : 'rgba(39,174,96,0.3)'}`,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
            }}
          >
            {f === 'PDF'
              ? <DocumentArrowDownIcon style={{ width: 11, height: 11, color: '#E74C3C' }} />
              : <TableCellsIcon        style={{ width: 11, height: 11, color: '#27AE60' }} />
            }
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: f === 'PDF' ? '#E74C3C' : '#27AE60', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              {f}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onSelect(reporte)}
          sx={{
            flex: 1, bgcolor: '#F39C12', color: '#FFFFFF', fontWeight: 700,
            fontSize: 12.5, borderRadius: '8px', textTransform: 'none',
            boxShadow: 'none', '&:hover': { bgcolor: '#D68910', boxShadow: 'none' },
          }}
        >
          Ver reporte
        </Button>
        {hasPdf && (
          <Button
            size="small"
            sx={{
              border: '1px solid rgba(231,76,60,0.35)', color: '#E74C3C',
              borderRadius: '8px', minWidth: 40, px: 1,
              '&:hover': { bgcolor: 'rgba(231,76,60,0.08)' },
            }}
          >
            <DocumentArrowDownIcon style={{ width: 16, height: 16 }} />
          </Button>
        )}
        {hasXls && (
          <Button
            size="small"
            sx={{
              border: '1px solid rgba(39,174,96,0.35)', color: '#27AE60',
              borderRadius: '8px', minWidth: 40, px: 1,
              '&:hover': { bgcolor: 'rgba(39,174,96,0.08)' },
            }}
          >
            <TableCellsIcon style={{ width: 16, height: 16 }} />
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── ReportesTab ──────────────────────────────────────────────────────────────
export default function ReportesTab({ rol }: { rol: string }) {
  const reportes = getReportesForRol(rol);
  const [selected, setSelected] = useState<ReporteDefinition | null>(null);

  if (selected) {
    return <ReporteViewer reporte={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, bgcolor: '#ECF0F1' }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-barlow, Geist, sans-serif)',
            fontSize: { xs: 22, md: 28 },
            fontWeight: 700,
            color: '#2C3E50',
            mb: 0.5,
          }}
        >
          Reportes disponibles
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: '#95A5A6' }}>
          Reportes asignados a tu rol · {reportes.length} disponible{reportes.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {reportes.length === 0 ? (
        <Box
          sx={{
            ...card, p: 6, textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}
        >
          <ExclamationCircleIcon style={{ width: 48, height: 48, color: '#BDC3C7' }} />
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#2C3E50' }}>
            Sin reportes asignados
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: '#95A5A6', maxWidth: 380 }}>
            No tienes reportes disponibles para tu rol actual. Contacta al administrador.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {reportes.map(r => (
            <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ReporteCard reporte={r} onSelect={setSelected} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
