export type EstadoCompra = 'pendiente' | 'parcial' | 'recibida' | 'anulada';

export type CompraItem = {
  id: string;
  compraId: string;
  productoId: string;
  descripcion: string;
  cantidad: number;
  /** Cantidad ya ingresada al stock (en la unidad del documento). */
  cantidadRecibida: number;
  costoUnitario: number;
  subtotal: number;
  /** Unidad en la que se compró (null = unidad base del producto). */
  unidadMedidaId: string | null;
  unidadCodigo: string | null;
  /** 1 unidad comprada = factorUnidad unidades base de stock. */
  factorUnidad: number;
};

export type Compra = {
  id: string;
  numero: string;
  proveedorId: string;
  proveedorNombre: string;
  usuarioId: string;
  tipoPagoId: string | null;
  almacenId: string | null;
  almacenNombre: string | null;
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
  /** Unidad alternativa (caja, paquete…); omitir para la unidad base. */
  unidadMedidaId?: string;
};

/** Cantidad a recibir ahora de un ítem (en la unidad del documento). */
export type RecibirCompraItemDto = {
  itemId: string;
  cantidad: number;
};

export type CreateCompraDto = {
  proveedorId: string;
  tipoPagoId?: string;
  almacenId: string;
  items: CreateCompraItemDto[];
  numeroFactura?: string;
  observaciones?: string;
};
