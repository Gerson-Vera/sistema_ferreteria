export type TipoCliente = 'natural' | 'juridica';
export type TipoDocumento = 'DNI' | 'RUC' | 'CE' | 'Carnet_Extranjeria';

export type Cliente = {
  id: string;
  codigo: string;
  tipo: TipoCliente;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type CreateClienteDto = {
  tipo: TipoCliente;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
};

export type UpdateClienteDto = Partial<CreateClienteDto>;
