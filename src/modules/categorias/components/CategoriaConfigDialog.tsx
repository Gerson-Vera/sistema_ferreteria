'use client';
import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { categoriasClientService } from '../services/categorias.client';
import { marcasClientService } from '@/modules/marcas/services/marcas.client';
import { unidadesMedidaClientService } from '@/modules/unidades-medida/services/unidades-medida.client';
import { proveedoresClientService } from '@/modules/proveedores/services/proveedores.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import type { Marca } from '@/modules/marcas/types';
import type { UnidadMedida } from '@/modules/unidades-medida/types';
import type { Proveedor } from '@/modules/proveedores/types';
import type { Almacen } from '@/modules/almacenes/types';
import type { Categoria, CategoriaConfig } from '../types';

type Props = {
  open: boolean;
  categoria: Categoria | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function CategoriaConfigDialog({ open, categoria, onClose, onSaved }: Props) {
  const [unidadMedidaId, setUnidadMedidaId] = useState<string>('');
  const [almacenId, setAlmacenId] = useState<string>('');
  const [selectedMarcas, setSelectedMarcas] = useState<Marca[]>([]);
  const [selectedProveedores, setSelectedProveedores] = useState<Proveedor[]>([]);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      marcasClientService.getAll(),
      unidadesMedidaClientService.getAll(),
      proveedoresClientService.getAll({ limit: 500 }),
      almacenesClientService.getAll(true),
    ]).then(([m, u, p, a]) => {
      setMarcas(m.filter(x => x.activo));
      setUnidades(u.filter(x => x.activo));
      setProveedores(p.data.filter(x => x.activo));
      setAlmacenes(a);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open || !categoria) return;
    setLoadingData(true);
    categoriasClientService.getConfig(categoria.id)
      .then((cfg: CategoriaConfig) => {
        setUnidadMedidaId(cfg.unidadMedidaId ?? '');
        setAlmacenId(cfg.almacenId ?? '');
        setSelectedMarcas(marcas.filter(m => cfg.marcaIds.includes(m.id)));
        setSelectedProveedores(proveedores.filter(p => cfg.proveedorIds.includes(p.id)));
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [open, categoria, marcas, proveedores]);

  const handleSave = async () => {
    if (!categoria) return;
    setSaving(true);
    try {
      await categoriasClientService.setConfig(categoria.id, {
        unidadMedidaId: unidadMedidaId || null,
        almacenId: almacenId || null,
        marcaIds: selectedMarcas.map(m => m.id),
        proveedorIds: selectedProveedores.map(p => p.id),
      });
      onSaved();
      onClose();
    } catch {
      // silently fail — caller shows toast
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Reglas de categoría
        {categoria && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {categoria.nombre}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Al registrar un producto de esta categoría, estos valores se pre-rellenarán automáticamente.
            </Typography>

            <Divider><Typography variant="caption">Valores por defecto</Typography></Divider>

            <FormControl fullWidth size="small" disabled={saving}>
              <InputLabel>Unidad de medida predeterminada</InputLabel>
              <Select
                value={unidadMedidaId}
                label="Unidad de medida predeterminada"
                onChange={e => setUnidadMedidaId(e.target.value)}
              >
                <MenuItem value="">Sin predeterminado</MenuItem>
                {unidades.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.codigo} — {u.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={saving}>
              <InputLabel>Almacén predeterminado</InputLabel>
              <Select
                value={almacenId}
                label="Almacén predeterminado"
                onChange={e => setAlmacenId(e.target.value)}
              >
                <MenuItem value="">Sin predeterminado</MenuItem>
                {almacenes.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider><Typography variant="caption">Marcas asociadas</Typography></Divider>

            <Autocomplete
              multiple
              options={marcas}
              getOptionLabel={(m: Marca) => m.nombre}
              value={selectedMarcas}
              onChange={(_, val) => setSelectedMarcas(val)}
              size="small"
              disabled={saving}
              renderInput={params => (
                <TextField {...params} label="Marcas sugeridas" placeholder="Buscar marca..." />
              )}
            />

            <Divider><Typography variant="caption">Proveedores asociados</Typography></Divider>

            <Autocomplete
              multiple
              options={proveedores}
              getOptionLabel={(p: Proveedor) => p.nombre}
              value={selectedProveedores}
              onChange={(_, val) => setSelectedProveedores(val)}
              size="small"
              disabled={saving}
              renderInput={params => (
                <TextField {...params} label="Proveedores sugeridos" placeholder="Buscar proveedor..." />
              )}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loadingData}
          startIcon={saving ? <CircularProgress size={14} /> : undefined}
        >
          {saving ? 'Guardando…' : 'Guardar reglas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
