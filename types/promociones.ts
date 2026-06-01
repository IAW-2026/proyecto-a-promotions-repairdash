export type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

export type Usuario = {
  id: string;
  nombre: string;
  fechaRegistro: string;
};

export type Promocion = {
  id: number;
  nombre: string;
  tipoDescuento: string;
  valor: number;
  descripcion: string;
  precioMinimo: string;
  destacada: boolean;
  usoUnico: boolean;
};
export type PromoForm = Omit<Promocion, 'id' | 'valor'> & {
  valor: string;
};
export type PromoDestacada = Pick<Promocion, 'id' | 'nombre' | 'tipoDescuento' | 'valor' | 'descripcion'>;

export type ItemHistorial = {
  id: number;
  nombre: string;
  fechaUso: Date;
  valorPagado: number;
  valorOriginal: number;
  trabajoId: number;
  usuarioId: string;
};
export type FilaHistorial = Omit<ItemHistorial, 'usuarioId'>;
export type ItemHistorialFormateado = Omit<ItemHistorial, 'fechaUso' | 'usuarioId' | 'trabajoId'> & { fechaUso: string };
