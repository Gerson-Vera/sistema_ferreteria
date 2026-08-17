export type TipoDevolucion = 'venta' | 'compra';
export type EstadoDevolucion = 'registrada' | 'anulada';

export type DevolucionItem = {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  /** Precio de venta o costo de compra unitario del documento original. */
  precioUnitario: number;
  subtotal: number;
};

export type Devolucion = {
  id: string;
  numero: string;
  tipo: TipoDevolucion;
  /** ID de la venta o compra original. */
  referenciaId: string;
  /** Número de la venta o compra original. */
  referenciaNumero: string;
  /** Cliente (devolución de venta) o proveedor (devolución de compra). */
  contraparteNombre: string;
  almacenId: string;
  almacenNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  motivo: string;
  estado: EstadoDevolucion;
  observaciones: string | null;
  total: number;
  items: DevolucionItem[];
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateDevolucionItemDto = {
  productoId: string;
  cantidad: number;
};

export type CreateDevolucionDto = {
  tipo: TipoDevolucion;
  /** ID de la venta (tipo=venta) o compra (tipo=compra) original. */
  referenciaId: string;
  /** Almacén al que reingresa (venta) o del que sale (compra) la mercadería. */
  almacenId: string;
  motivo: string;
  observaciones?: string;
  items: CreateDevolucionItemDto[];
};
