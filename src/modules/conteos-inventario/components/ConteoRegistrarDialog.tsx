'use client';
import { useState, useEffect, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SearchIcon from '@mui/icons-material/Search';
import type { Conteo, RegistrarConteoItemDto } from '../types';

type Props = {
  conteo: Conteo | null;
  open: boolean;
  /** 'contar' permite editar; 'ver' es solo lectura. */
  mode: 'contar' | 'ver';
  loading?: boolean;
  onGuardar?: (conteoId: string, items: RegistrarConteoItemDto[]) => void;
  onClose: () => void;
};

export default function ConteoRegistrarDialog({ conteo, open, mode, loading, onGuardar, onClose }: Props) {
  // Valor tipeado por ítem ('' = sin contar)
  const [valores, setValores] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (conteo && open) {
      const init: Record<string, string> = {};
      for (const i of conteo.items) init[i.id] = i.stockFisico !== null ? String(i.stockFisico) : '';
      setValores(init);
      setSearch('');
    }
  }, [conteo, open]);

  const filtrados = useMemo(() => {
    if (!conteo) return [];
    const q = search.toLowerCase();
    return conteo.items.filter(
      i => i.productoNombre.toLowerCase().includes(q) || i.productoSku.toLowerCase().includes(q),
    );
  }, [conteo, search]);

  if (!conteo) return null;

  const editable = mode === 'contar' && conteo.estado === 'abierto';

  const setValor = (id: string, value: string) => {
    if (value === '' || /^\d+$/.test(value)) setValores(prev => ({ ...prev, [id]: value }));
  };

  // Solo se envían los ítems con valor ingresado y distinto al ya guardado
  const cambios: RegistrarConteoItemDto[] = conteo.items
    .filter(i => {
      const v = valores[i.id];
      if (v === undefined || v === '') return false;
      return parseInt(v) !== i.stockFisico;
    })
    .map(i => ({ itemId: i.id, stockFisico: parseInt(valores[i.id]) }));

  const contadosAhora = conteo.items.filter(i => (valores[i.id] ?? '') !== '').length;
  const difAhora = conteo.items.filter(i => {
    const v = valores[i.id];
    return v !== undefined && v !== '' && parseInt(v) !== i.stockSistema;
  }).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <FactCheckIcon color={editable ? 'primary' : 'action'} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {editable ? 'Registrar conteo físico' : 'Detalle del conteo'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {conteo.numero} · {conteo.almacenNombre} · {conteo.totalItems} producto(s)
            </Typography>
          </Box>
          <Chip
            label={`${contadosAhora}/${conteo.totalItems} contados`}
            size="small"
            color={contadosAhora === conteo.totalItems ? 'success' : 'default'}
          />
          {difAhora > 0 && (
            <Chip label={`${difAhora} con diferencia`} size="small" color="warning" />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {editable && (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Ingresa lo contado físicamente. Puedes guardar avances parciales; al aplicar, el stock
            se ajustará a lo contado (solo de los productos con conteo registrado).
          </Alert>
        )}

        <TextField
          size="small"
          fullWidth
          placeholder="Buscar producto o SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 1.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="disabled" />
                </InputAdornment>
              ),
            },
          }}
        />

        <TableContainer sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Stock sistema</TableCell>
                <TableCell align="center">Conteo físico</TableCell>
                <TableCell align="center">Diferencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.map(item => {
                const v = valores[item.id] ?? '';
                const fisico = v === '' ? null : parseInt(v);
                const dif = fisico !== null ? fisico - item.stockSistema : null;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.productoNombre}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {item.productoSku}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{item.stockSistema}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {editable ? (
                        <TextField
                          type="number"
                          size="small"
                          value={v}
                          onChange={e => setValor(item.id, e.target.value)}
                          placeholder="—"
                          slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center' } } }}
                          sx={{ width: 90 }}
                        />
                      ) : (
                        <Typography variant="body2">{item.stockFisico ?? '—'}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {dif === null ? (
                        <Typography variant="caption" color="text.disabled">sin contar</Typography>
                      ) : dif === 0 ? (
                        <Chip label="OK" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip
                          label={dif > 0 ? `+${dif}` : dif}
                          size="small"
                          color={dif > 0 ? 'info' : 'error'}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {editable ? 'Cancelar' : 'Cerrar'}
        </Button>
        {editable && (
          <Button
            variant="contained"
            onClick={() => onGuardar?.(conteo.id, cambios)}
            disabled={loading || cambios.length === 0}
          >
            {loading ? 'Guardando…' : `Guardar conteo (${cambios.length} cambio(s))`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
