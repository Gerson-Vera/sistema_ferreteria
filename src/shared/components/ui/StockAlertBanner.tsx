'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

type AlertaProducto = {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
};

export default function StockAlertBanner() {
  const [productos, setProductos] = useState<AlertaProducto[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    fetch('/api/productos/stock-bajo')
      .then(r => r.json())
      .then(json => {
        if (json.data?.productos) setProductos(json.data.productos);
      })
      .catch(() => {});
  }, []);

  if (productos.length === 0 || !open) return null;

  return (
    <Collapse in={open}>
      <Alert
        severity="warning"
        onClose={() => setOpen(false)}
        sx={{ mb: 2 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          Stock bajo — {productos.length} producto{productos.length !== 1 ? 's' : ''} por reponer
        </AlertTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
          {productos.slice(0, 12).map(p => (
            <Chip
              key={p.id}
              label={`${p.nombre} · ${p.stock}/${p.stockMinimo}`}
              size="small"
              color="warning"
              variant="outlined"
            />
          ))}
          {productos.length > 12 && (
            <Typography variant="caption" sx={{ alignSelf: 'center', color: 'warning.dark' }}>
              +{productos.length - 12} más
            </Typography>
          )}
        </Box>
      </Alert>
    </Collapse>
  );
}
