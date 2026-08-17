'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ImageIcon from '@mui/icons-material/Image';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';

type ScanResult = {
  codigo: string;
  ok: boolean;
  mensaje: string;
  hora: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Recibe el código decodificado; devuelve si se encontró producto y el mensaje a mostrar. */
  onDetect: (codigo: string) => Promise<{ ok: boolean; mensaje: string }>;
};

/** Pitido corto de confirmación (grave = error, agudo = ok). */
function beep(ok: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => ctx.close();
  } catch {
    // sin audio disponible: continuar en silencio
  }
}

export default function EscanerCodigoDialog({ open, onClose, onDetect }: Props) {
  const [modo, setModo] = useState<'camara' | 'imagen'>('camara');
  const [camaraError, setCamaraError] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [procesandoImagen, setProcesandoImagen] = useState(false);
  const [imagenError, setImagenError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<ScanResult[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Evita procesar el mismo código en ráfaga mientras sigue frente a la cámara
  const ultimoRef = useRef<{ codigo: string; ts: number }>({ codigo: '', ts: 0 });
  const ocupadoRef = useRef(false);

  const registrar = useCallback(async (codigo: string) => {
    if (ocupadoRef.current) return;
    const ahora = Date.now();
    if (ultimoRef.current.codigo === codigo && ahora - ultimoRef.current.ts < 2500) return;
    ultimoRef.current = { codigo, ts: ahora };
    ocupadoRef.current = true;
    try {
      const res = await onDetect(codigo);
      beep(res.ok);
      setHistorial(prev => [
        { codigo, ok: res.ok, mensaje: res.mensaje, hora: new Date().toLocaleTimeString('es-PE') },
        ...prev.slice(0, 9),
      ]);
    } finally {
      ocupadoRef.current = false;
    }
  }, [onDetect]);

  // Cámara en vivo: escaneo continuo tipo pistola
  useEffect(() => {
    if (!open || modo !== 'camara') return;
    let cancelado = false;
    setCamaraError(null);
    setIniciando(true);

    const reader = new BrowserMultiFormatReader();
    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        result => { if (result && !cancelado) registrar(result.getText()); },
      )
      .then(controls => {
        if (cancelado) { controls.stop(); return; }
        controlsRef.current = controls;
        setIniciando(false);
      })
      .catch(err => {
        if (cancelado) return;
        setIniciando(false);
        setCamaraError(
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Habilítalo en el navegador o usa "Subir imagen".'
            : 'No se pudo iniciar la cámara. Verifica que esté conectada o usa "Subir imagen".',
        );
      });

    return () => {
      cancelado = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open, modo, registrar]);

  const handleImagen = async (file: File) => {
    setImagenError(null);
    setProcesandoImagen(true);
    const url = URL.createObjectURL(file);
    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(url);
      await registrar(result.getText());
    } catch {
      setImagenError('No se detectó ningún código en la imagen. Prueba con una foto más nítida y cercana.');
    } finally {
      URL.revokeObjectURL(url);
      setProcesandoImagen(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleClose = () => {
    setHistorial([]);
    setImagenError(null);
    onClose();
  };

  const agregados = historial.filter(h => h.ok).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <QrCodeScannerIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">Escanear productos</Typography>
            <Typography variant="caption" color="text.secondary">
              QR y códigos de barras (EAN, Code 128…) — cada lectura agrega el producto a la venta
            </Typography>
          </Box>
          {agregados > 0 && <Chip label={`${agregados} agregado(s)`} color="success" size="small" />}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <ToggleButtonGroup
          value={modo}
          exclusive
          onChange={(_, v) => v && setModo(v)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="camara"><CameraAltIcon fontSize="small" sx={{ mr: 1 }} /> Cámara en vivo</ToggleButton>
          <ToggleButton value="imagen"><ImageIcon fontSize="small" sx={{ mr: 1 }} /> Subir imagen</ToggleButton>
        </ToggleButtonGroup>

        {modo === 'camara' ? (
          <Box sx={{ position: 'relative' }}>
            {camaraError ? (
              <Alert severity="error">{camaraError}</Alert>
            ) : (
              <>
                <Box
                  component="video"
                  ref={videoRef}
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    bgcolor: 'common.black',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                  }}
                />
                {iniciando && (
                  <Stack
                    spacing={1}
                    sx={{
                      position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center',
                      color: 'common.white',
                    }}
                  >
                    <CircularProgress size={28} color="inherit" />
                    <Typography variant="caption">Iniciando cámara…</Typography>
                  </Stack>
                )}
                {!iniciando && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
                      color: 'common.white', textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    Apunta la cámara al código — se escanea automáticamente
                  </Typography>
                )}
              </>
            )}
          </Box>
        ) : (
          <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImagen(f); }}
            />
            <Button
              variant="outlined"
              startIcon={procesandoImagen ? <CircularProgress size={16} /> : <UploadFileIcon />}
              onClick={() => fileRef.current?.click()}
              disabled={procesandoImagen}
            >
              {procesandoImagen ? 'Analizando imagen…' : 'Elegir foto del código'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Sube una foto donde el código QR o de barras se vea completo y enfocado.
            </Typography>
            {imagenError && <Alert severity="warning" sx={{ width: '100%' }}>{imagenError}</Alert>}
          </Stack>
        )}

        {historial.length > 0 && (
          <List dense sx={{ mt: 1, maxHeight: 180, overflowY: 'auto', bgcolor: 'action.hover', borderRadius: 1 }}>
            {historial.map((h, i) => (
              <ListItem key={`${h.codigo}-${h.hora}-${i}`}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {h.ok
                    ? <CheckCircleIcon color="success" fontSize="small" />
                    : <ErrorIcon color="error" fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={h.mensaje}
                  secondary={`${h.codigo} · ${h.hora}`}
                  slotProps={{
                    primary: { variant: 'body2' },
                    secondary: { variant: 'caption', sx: { fontFamily: 'monospace' } },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="contained">Listo</Button>
      </DialogActions>
    </Dialog>
  );
}
