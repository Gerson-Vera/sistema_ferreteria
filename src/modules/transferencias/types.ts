export type EstadoTransferencia = 'pendiente' | 'enviada' | 'recibida' | 'anulada';

export type TransferenciaItem = {
  id: string;
  transferenciaId: string;
  productoId: string;
  productoNombre: string;
  productoSku: string;
  cantidad: number;
};

export type Transferencia = {
  id: string;
  numero: string;
  almacenOrigenId: string;
  almacenOrigenNombre: string;
  almacenDestinoId: string;
  almacenDestinoNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  estado: EstadoTransferencia;
  observaciones: string | null;
  fechaEnvio: Date | null;
  fechaRecepcion: Date | null;
  items: TransferenciaItem[];
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateTransferenciaItemDto = {
  productoId: string;
  cantidad: number;
};

export type CreateTransferenciaDto = {
  almacenOrigenId: string;
  almacenDestinoId: string;
  observaciones?: string;
  items: CreateTransferenciaItemDto[];
};
