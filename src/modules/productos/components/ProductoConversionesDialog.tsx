'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '@/shared/context/ToastContext';
import { productosClientService } from '../services/productos.client';
import { unidadesMedidaClientService } from '@/modules/unidades-medida/services/unidades-medida.client';
import type { Producto } from '../types';
import type { UnidadMedida } from '@/modules/unidades-medida/types';

type Draft = { unidadMedidaId: string; factor: string };

type Props = {
  producto: Producto | null;
  onClose: () => void;
};

export default function ProductoConversionesDialog({ producto, onClose }: Props) {
  const showToast = useToast();
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [items, setItems] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    unidadesMedidaClientService.getAll(true).then(setUnidades).catch(() => {});
  }, []);

  useEffect(() => {
    if (!producto) return;
    setError(null);
    setLoading(true);
    productosClientService.getConversiones(producto.id)
      .then(conv => setItems(conv.map(c => ({ unidadMedidaId: c.unidadMedidaId, factor: String(c.factor) }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [producto]);

  if (!producto) return null;

  const unidadBase = unidades.find(u => u.id === producto.unidadMedidaId);
  const baseLabel = unidadBase ? `${unidadBase.nombre} (${unidadBase.codigo})` : 'unidad base';
  const usadas = new Set(items.map(i => i.unidadMedidaId));

  const handleSave = async () => {
    setError(null);
    for (const it of items) {
      if (!it.unidadMedidaId) { setError('Selecciona la unidad en todas las filas'); return; }
      const f = Number(it.factor);
      if (isNaN(f) || f <= 0) { setError('Todos los factores deben ser mayores a 0'); return; }
    }
    setSaving(true);
    try {
      await productosClientService.setConversiones(
        producto.id,
        items.map(i => ({ unidadMedidaId: i.unidadMedidaId, factor: Number(i.factor) })),
      );
      showToast('Conversiones guardadas', 'success');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Unidades alternativas — {producto.nombre}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            El stock se controla en <strong>{baseLabel}</strong>. Define aquí las unidades en las que
            también compras o vendes este producto y su equivalencia.
          </Typography>

          {error && <Typography variant="body2" color="error.main">{error}</Typography>}

          {items.map((item, idx) => (
            <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">1</Typography>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Unidad</InputLabel>
                <Select
                  value={item.unidadMedidaId}
                  label="Unidad"
                  onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, unidadMedidaId: e.target.value } : it))}
                  disabled={loading || saving}
                >
                  {unidades
                    .filter(u => u.id !== producto.unidadMedidaId && (!usadas.has(u.id) || u.id === item.unidadMedidaId))
                    .map(u => (
                      <MenuItem key={u.id} value={u.id}>{u.nombre} ({u.codigo})</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">=</Typography>
              <TextField
                type="number"
                label="Factor"
                size="small"
                value={item.factor}
                onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, factor: e.target.value } : it))}
                sx={{ width: 110 }}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                disabled={loading || saving}
              />
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }} noWrap>
                {unidadBase?.codigo ?? 'unid. base'}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                disabled={saving}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}

          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => setItems(prev => [...prev, { unidadMedidaId: '', factor: '' }])}
            disabled={loading || saving}
          >
            Agregar conversión
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
