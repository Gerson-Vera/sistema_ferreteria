export type EstadoOrden = 'borrador' | 'enviada' | 'recibida' | 'anulada';

export type OrdenCompraItem = {
  id: string;
  ordenCompraId: string;
  productoId: string | null;
  descripcion: string;
  detalles: string | null;
  cantidad: number;
  cantidadRecibida: number;
  costoUnitario: number;
  subtotal: number;
  esNuevoProducto: boolean;
  precioVentaSugerido: number | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
  productoNombre: string | null;
};

export type OrdenCompra = {
  id: string;
  numero: string;
  proveedorId: string;
  proveedorNombre: string;
  proveedorEmail: string | null;
  usuarioId: string;
  usuarioNombre: string;
  estado: EstadoOrden;
  observaciones: string | null;
  correoEnviado: boolean;
  fechaEnvio: Date | null;
  fechaRecepcion: Date | null;
  items: OrdenCompraItem[];
  subtotal: number;
  igv: number;
  total: number;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type OrdenCompraResumen = Omit<OrdenCompra, 'items'> & { totalItems: number };

export type CreateOrdenItemDto = {
  productoId?: string;
  descripcion: string;
  detalles?: string;
  cantidad: number;
  costoUnitario: number;
  esNuevoProducto: boolean;
  precioVentaSugerido?: number;
  categoriaId?: string;
};

export type CreateOrdenCompraDto = {
  proveedorId: string;
  observaciones?: string;
  items: CreateOrdenItemDto[];
};

export type UpdateOrdenCompraDto = {
  observaciones?: string;
};

export type RecibirOrdenResult = {
  orden: OrdenCompraResumen;
  productosCreados: number;
  movimientos: { productoNombre: string; cantidadOrdenada: number; cantidadAceptada: number; stockFinal: number }[];
};
