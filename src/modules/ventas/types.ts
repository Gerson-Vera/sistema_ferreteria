export type EstadoVenta = 'pendiente' | 'completada' | 'anulada';

export type VentaItem = {
  id: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type Venta = {
  id: string;
  numero: string;
  clienteId: string;
  usuarioId: string;
  items: VentaItem[];
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoVenta;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateVentaItemDto = {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
};

export type CreateVentaDto = {
  clienteId: string;
  items: CreateVentaItemDto[];
  observaciones?: string;
};
