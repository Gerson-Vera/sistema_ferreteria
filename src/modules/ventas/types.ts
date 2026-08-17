export type EstadoVenta = 'pendiente' | 'completada' | 'anulada';

export type VentaItem = {
  id: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  /** Unidad en la que se vendió (null = unidad base del producto). */
  unidadMedidaId: string | null;
  unidadCodigo: string | null;
  /** 1 unidad vendida = factorUnidad unidades base de stock. */
  factorUnidad: number;
};

export type Venta = {
  id: string;
  numero: string;
  clienteId: string;
  clienteNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  tipoPagoId: string | null;
  almacenId: string | null;
  almacenNombre: string | null;
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
  /** Unidad alternativa (caja, paquete…); omitir para la unidad base. */
  unidadMedidaId?: string;
};

export type CreateVentaDto = {
  clienteId: string;
  tipoPagoId?: string;
  almacenId: string;
  items: CreateVentaItemDto[];
  observaciones?: string;
};
