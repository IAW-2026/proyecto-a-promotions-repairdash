export type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

export type PromoForm = {
  nombre: string;
  tipoDescuento: string;
  valor: string;
  descripcion: string;
  precioMinimo: string;
  destacada: boolean;
  usoUnico: boolean;
};

export type Errores = Partial<Record<keyof PromoForm | 'fechaFin' | 'filtroUsuarios' | 'categorias', string>>;

export type PropsFormulario =
  | { modo: 'crear' }
  | { modo: 'editar'; promocionId: string };