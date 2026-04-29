export type EstadoCompra = 'pendiente' | 'recibida' | 'anulada';

export type CompraItem = {
  id: string;
  compraId: string;
  productoId: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
};

export type Compra = {
  id: string;
  numero: string;
  proveedorId: string;
  usuarioId: string;
  items: CompraItem[];
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoCompra;
  numeroFactura: string | null;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateCompraItemDto = {
  productoId: string;
  cantidad: number;
  costoUnitario: number;
};

export type CreateCompraDto = {
  proveedorId: string;
  items: CreateCompraItemDto[];
  numeroFactura?: string;
  observaciones?: string;
};
