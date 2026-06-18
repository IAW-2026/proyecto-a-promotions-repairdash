// app/componentes/promociones/shared.tsx
import type { ReactNode } from 'react';

export type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

export function esFiltroUsuarios(value: unknown): value is FiltroUsuarios {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function formatearMonto(valor: number | null) {
  if (valor === null || valor === 0) return 'Sin mínimo de compra requerido';
  return `$${valor.toLocaleString('es-AR')}`;
}

export function formatearDescuento(tipo: string, valor: number) {
  return tipo === '$'
    ? `$${valor.toLocaleString('es-AR')}`
    : `${valor}% OFF`;
}

export function CampoDetalle({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[#C392DD] text-xs font-bold uppercase tracking-wider">{label}</p>
      <div className="text-white text-sm font-medium leading-relaxed">{children}</div>
    </div>
  );
}

export function SeccionCategorias({
  categorias,
  nombresPorCategoria,
  fallbackNombre = 'Servicio General',
}: {
  categorias: string[];
  nombresPorCategoria: Map<string, string>;
  fallbackNombre?: string;
}) {
  return (
    <div className="flex flex-col gap-2 pt-4 border-t border-[#8D62A5]/20">
      <p className="text-[#C392DD] text-xs font-bold uppercase tracking-wider">
        Aplica en los siguientes servicios
      </p>
      {categorias.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {categorias.map((categoriaId) => (
            <span
              key={categoriaId}
              className="px-3 py-1 bg-[#271033] text-white rounded-xl text-xs font-semibold border border-[#8D62A5]/60"
            >
              {nombresPorCategoria.get(categoriaId) ?? fallbackNombre}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-white text-sm font-medium">
          Disponible para todos los tipos de servicios
        </p>
      )}
    </div>
  );
}