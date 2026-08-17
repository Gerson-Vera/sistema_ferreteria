export type EstadoDespacho = 'pendiente' | 'en_preparacion' | 'despachado' | 'entregado' | 'anulado';

export type Despacho = {
  id: string;
  numero: string;
  ventaId: string;
  ventaNumero: string;
  clienteNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  direccionEntrega: string;
  contacto: string | null;
  telefono: string | null;
  transportista: string | null;
  observaciones: string | null;
  estado: EstadoDespacho;
  fechaDespacho: Date | null;
  fechaEntrega: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateDespachoDto = {
  ventaId: string;
  direccionEntrega: string;
  contacto?: string;
  telefono?: string;
  transportista?: string;
  observaciones?: string;
};
