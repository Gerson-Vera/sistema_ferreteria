import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

export type EtiquetaItem = {
  nombre: string;
  sku: string;
  codigoBarras: string;
  precioVenta: number;
  copias?: number;
};

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 8;
const COLS = 3;
const ROWS = 7;
const LABEL_W = (PAGE_W - MARGIN * 2) / COLS;
const LABEL_H = (PAGE_H - MARGIN * 2) / ROWS;

function renderBarcodeCanvas(codigo: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, codigo, {
    format: 'CODE128',
    width: 2,
    height: 55,
    displayValue: true,
    fontSize: 13,
    margin: 4,
  });
  return canvas;
}

/** Genera un PDF A4 con etiquetas (nombre, precio y código de barras) listas para imprimir y recortar. */
export function generarEtiquetasPDF(items: EtiquetaItem[]): void {
  const expandido = items.flatMap(item =>
    Array.from({ length: Math.max(1, item.copias ?? 1) }, () => item)
  );
  if (expandido.length === 0) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const fmt = (n: number) => `S/ ${n.toFixed(2)}`;
  const perPage = COLS * ROWS;

  expandido.forEach((item, i) => {
    const posInPage = i % perPage;
    if (i > 0 && posInPage === 0) doc.addPage();

    const col = posInPage % COLS;
    const row = Math.floor(posInPage / COLS);
    const x = MARGIN + col * LABEL_W;
    const y = MARGIN + row * LABEL_H;

    doc.setDrawColor(210, 210, 210);
    doc.rect(x, y, LABEL_W, LABEL_H);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    const nombreLines = doc.splitTextToSize(item.nombre, LABEL_W - 4) as string[];
    doc.text(nombreLines.slice(0, 2), x + LABEL_W / 2, y + 4.5, { align: 'center' });

    try {
      const canvas = renderBarcodeCanvas(item.codigoBarras);
      const targetH = LABEL_H - 17;
      const maxW = LABEL_W - 6;
      let finalW = targetH * (canvas.width / canvas.height);
      let finalH = targetH;
      if (finalW > maxW) {
        finalW = maxW;
        finalH = maxW * (canvas.height / canvas.width);
      }
      const imgX = x + (LABEL_W - finalW) / 2;
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', imgX, y + 10, finalW, finalH);
    } catch {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.codigoBarras, x + LABEL_W / 2, y + LABEL_H / 2, { align: 'center' });
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(item.precioVenta), x + LABEL_W / 2, y + LABEL_H - 2, { align: 'center' });
  });

  doc.save(`Etiquetas-Codigo-Barras-${expandido.length}.pdf`);
}
