'use client';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useToast } from '@/shared/context/ToastContext';
import { productosClientService } from '../services/productos.client';
import { generarEtiquetasPDF } from '@/shared/utils/etiquetas-pdf';
import type { Producto } from '../types';

type Props = {
  productos: Producto[];
  onClose: () => void;
  onGenerated?: () => void;
};

export default function EtiquetasBarcodeDialog({ productos, onClose, onGenerated }: Props) {
  const showToast = useToast();
  const [copias, setCopias] = useState('1');
  const [generating, setGenerating] = useState(false);

  useEffect(() => { setCopias('1'); }, [productos]);

  if (productos.length === 0) return null;

  const cantidad = Number(copias);
  const copiasValidas = Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= 99;

  const handleGenerate = async () => {
    if (!copiasValidas) return;
    setGenerating(true);
    try {
      const ids = productos.map(p => p.id);
      const actualizados = await productosClientService.ensureCodigosBarras(ids);
      const porId = new Map(actualizados.map(p => [p.id, p]));

      generarEtiquetasPDF(productos.map(p => {
        const actual = porId.get(p.id) ?? p;
        return {
          nombre: actual.nombre,
          sku: actual.sku,
          codigoBarras: actual.codigoBarras || actual.sku,
          precioVenta: actual.precioVenta,
          copias: cantidad,
        };
      }));

      showToast(
        `PDF generado: ${productos.length * cantidad} etiqueta(s) de ${productos.length} producto(s)`,
        'success',
      );
      onGenerated?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al generar códigos de barras', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Generar código de barras</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Se generará un PDF con las etiquetas listas para imprimir y pegar en el producto.
          Si un producto no tiene código de barras, se le asignará uno automáticamente.
        </Typography>

        <List dense sx={{ maxHeight: 220, overflow: 'auto', bgcolor: '#F8FAFC', borderRadius: 1, mb: 2 }}>
          {productos.map(p => (
            <ListItem key={p.id} sx={{ py: 0.25 }}>
              <ListItemText
                primary={p.nombre}
                secondary={p.codigoBarras ?? 'Se generará al imprimir'}
                slotProps={{
                  primary: { sx: { fontSize: 13.5 } },
                  secondary: { sx: { fontSize: 11.5, fontFamily: 'monospace' } },
                }}
              />
            </ListItem>
          ))}
        </List>

        <TextField
          label="Copias por producto"
          type="number"
          size="small"
          value={copias}
          onChange={e => setCopias(e.target.value)}
          error={!copiasValidas}
          helperText={!copiasValidas ? 'Debe ser un número entre 1 y 99' : ' '}
          fullWidth
          slotProps={{ htmlInput: { min: 1, max: 99 } }}
          disabled={generating}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={generating}>Cancelar</Button>
        <Button variant="contained" onClick={handleGenerate} disabled={generating || !copiasValidas}>
          {generating ? 'Generando…' : 'Generar PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
