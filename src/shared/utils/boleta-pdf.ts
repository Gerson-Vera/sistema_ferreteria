import jsPDF from 'jspdf';
import type { Venta } from '@/modules/ventas/types';

type BoletaItem = {
  nombre: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

type BoletaData = {
  venta: Venta;
  items: BoletaItem[];
  clienteNombre: string;
  tipoPagoNombre?: string;
};

const PAGE_W = 210; // A4 mm
const MARGIN = 14;
const COL = PAGE_W - MARGIN * 2;

function line(doc: jsPDF, y: number) {
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

function header(doc: jsPDF, text: string, y: number, size = 10): number {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN, y);
  return y + size * 0.45;
}

function row(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(label, MARGIN, y);
  doc.text(value, PAGE_W - MARGIN, y, { align: 'right' });
  return y + 5.5;
}

export function generarBoletaPDF({ venta, items, clienteNombre, tipoPagoNombre }: BoletaData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const fmt = (n: number) => `S/ ${n.toFixed(2)}`;
  const fecha = new Date(venta.creadoEn);
  const fechaStr = fecha.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const horaStr = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  let y = 20;

  // ── Encabezado empresa ──
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FERRETERÍA', PAGE_W / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión de Inventario', PAGE_W / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  doc.text('Jr. Los Herreros 120, Lima, Perú', PAGE_W / 2, y, { align: 'center' });
  y += 10;

  line(doc, y); y += 6;

  // ── Número de boleta ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`BOLETA DE VENTA`, PAGE_W / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(11);
  doc.text(venta.numero, PAGE_W / 2, y, { align: 'center' });
  y += 8;

  line(doc, y); y += 6;

  // ── Datos de la venta ──
  y = row(doc, 'Fecha:', `${fechaStr}  ${horaStr}`, y);
  y = row(doc, 'Cliente:', clienteNombre, y);
  if (tipoPagoNombre) y = row(doc, 'Forma de pago:', tipoPagoNombre, y);
  y = row(doc, 'Estado:', venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1), y);
  y += 4;

  line(doc, y); y += 6;

  // ── Cabecera de tabla ──
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Producto', MARGIN, y);
  doc.text('Cant.', MARGIN + 90, y, { align: 'right' });
  doc.text('P.Unit.', MARGIN + 122, y, { align: 'right' });
  doc.text('Subtotal', PAGE_W - MARGIN, y, { align: 'right' });
  y += 3;
  line(doc, y); y += 5;

  // ── Filas de productos ──
  doc.setFont('helvetica', 'normal');
  for (const item of items) {
    const maxW = 82;
    const lines = doc.splitTextToSize(item.nombre, maxW) as string[];
    doc.text(lines, MARGIN, y);
    doc.text(String(item.cantidad), MARGIN + 90, y, { align: 'right' });
    doc.text(fmt(item.precioUnitario), MARGIN + 122, y, { align: 'right' });
    doc.text(fmt(item.subtotal), PAGE_W - MARGIN, y, { align: 'right' });
    y += lines.length * 5 + 1;
  }

  y += 3;
  line(doc, y); y += 6;

  // ── Totales ──
  y = row(doc, 'Subtotal:', fmt(venta.subtotal), y);
  y = row(doc, 'IGV (18%):', fmt(venta.igv), y);
  y += 1;
  line(doc, y); y += 5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', MARGIN, y);
  doc.text(fmt(venta.total), PAGE_W - MARGIN, y, { align: 'right' });
  y += 10;

  line(doc, y); y += 8;

  // ── Pie ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por su compra', PAGE_W / 2, y, { align: 'center' });
  y += 5;
  doc.text('Este documento es una representación de la boleta electrónica', PAGE_W / 2, y, { align: 'center' });

  doc.save(`Boleta-${venta.numero}.pdf`);
}
