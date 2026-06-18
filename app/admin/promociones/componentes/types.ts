// types.ts unificado

// — Compartidos —
export type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

// — Formulario de promoción —
export type PromoForm = {
  nombre: string;
  tipoDescuento: string;
  valor: string;
  descripcion: string;
  precioMinimo: string;
  destacada: boolean;
  usoUnico: boolean;
};

export type ErroresPromoForm = Partial<Record<keyof PromoForm | 'fechaFin' | 'filtroUsuarios' | 'categorias', string>>;

export type PropsFormulario =
  | { modo: 'crear' }
  | { modo: 'editar'; promocionId: string };

// — Filtro de usuarios —
export type Usuario = {
  id: string;
  nombre: string;
  fechaRegistro: string;
};

export type Modo = 'todos' | 'filtros' | 'especificos';

export type ErroresFiltro = {
  despues: string;
  antes: string;
  usos: string;
};