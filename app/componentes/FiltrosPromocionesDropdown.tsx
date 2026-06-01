'use client';

import type { RefObject } from 'react';

export type OpcionFiltro = {
  id: string;
  nombre: string;
};

export type FiltroExtra = {
  nombre: string;
  label: string;
  opciones: OpcionFiltro[];
  seleccionados: string[];
};

type Props = {
  esAdmin: boolean;
  detailsRef: RefObject<HTMLDetailsElement | null>;
  tiposServicio: OpcionFiltro[];
  serviciosPendientes: string[];
  filtrosExtra: FiltroExtra[];
  extrasPendientes: Record<string, string[]>;
  onToggleServicio: (id: string) => void;
  onToggleExtra: (nombreFiltro: string, id: string) => void;
  onAplicar: () => void;
};

function resumen(seleccionados: string[], opciones: OpcionFiltro[]) {
  if (seleccionados.length === 0) return 'Todos los servicios';
  if (seleccionados.length === 1) {
    return opciones.find((opcion) => opcion.id === seleccionados[0])?.nombre ?? '1 seleccionado';
  }
  return `${seleccionados.length} seleccionados`;
}

function BotonCerrar({ detailsRef }: { detailsRef: RefObject<HTMLDetailsElement | null> }) {
  return (
    <button
      type="button"
      onClick={() => detailsRef.current?.removeAttribute('open')}
      className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg border border-[#8D62A5]/30 bg-[#271033]/40 text-[#C392DD] hover:border-[#F500F1] hover:text-white hover:bg-[#F500F1]/20 transition-all z-40 group/btn"
      title="Cerrar sin aplicar"
    >
      <svg className="h-4 w-4 transition-transform group-hover/btn:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

export default function FiltrosPromocionesDropdown({
  esAdmin,
  detailsRef,
  tiposServicio,
  serviciosPendientes,
  filtrosExtra,
  extrasPendientes,
  onToggleServicio,
  onToggleExtra,
  onAplicar,
}: Props) {
  if (!esAdmin) {
    return (
      <>
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#C392DD]/80">Servicios</label>
        <details ref={detailsRef} className="group relative w-full">
          <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-[#8D62A5]/40 bg-[#271033]/60 px-4 text-sm font-medium text-[#FBDAF9] transition-all hover:border-[#C392DD]/60 hover:bg-[#271033]">
            <div className="flex flex-row items-center gap-1.5 max-w-[85%] overflow-hidden">
              <span className="text-sm font-normal text-[#C392DD]/80 whitespace-nowrap">
                Filtrar por servicios:
              </span>
              <span className="truncate text-sm font-semibold text-white">
                {resumen(serviciosPendientes, tiposServicio)}
              </span>
            </div>
            <svg className="h-4 w-4 text-[#C392DD] shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="absolute z-30 mt-2 w-full min-w-[250px] overflow-hidden rounded-xl border border-[#C392DD]/40 bg-[#1f0929] shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-150">
            <BotonCerrar detailsRef={detailsRef} />
            <div className="p-3 pt-11">
              <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {tiposServicio.map((tipo) => (
                  <label key={tipo.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#FBDAF9] transition-colors hover:bg-[#271033]">
                    <input
                      type="checkbox"
                      checked={serviciosPendientes.includes(tipo.id)}
                      onChange={() => onToggleServicio(tipo.id)}
                      className="h-4 w-4 rounded border-[#8D62A5] bg-[#271033] text-[#F500F1] accent-[#F500F1] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="truncate">{tipo.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#16051d] p-2.5 border-t border-[#C392DD]/10">
              <button
                type="button"
                onClick={onAplicar}
                className="w-full h-9 rounded-lg bg-gradient-to-r from-[#F500F1] to-[#D000CD] hover:from-[#d600d2] hover:to-[#b300b0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,0,241,0.25)] active:scale-[0.98]"
              >
                Filtrar
              </button>
            </div>
          </div>
        </details>
      </>
    );
  }

  return (
    <>
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#C392DD]/80">Parámetros</label>
      <details ref={detailsRef} className="group relative w-full">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-[#8D62A5]/40 bg-[#271033]/60 px-4 text-sm font-medium text-[#FBDAF9] transition-all hover:border-[#C392DD]/60 hover:bg-[#271033]">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#C392DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-xs font-semibold tracking-wide uppercase text-[#C392DD]">Filtros de búsqueda</span>
          </div>
          <svg className="h-4 w-4 text-[#C392DD] shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="absolute left-0 z-30 mt-2 max-h-[80vh] w-full min-w-[300px] sm:min-w-[520px] overflow-hidden rounded-xl border border-[#C392DD]/40 bg-[#1f0929] shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-150">
          <BotonCerrar detailsRef={detailsRef} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 pt-11 sm:pt-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F500F1] border-b border-[#C392DD]/10 pb-1.5">
                Tipos de Servicio
              </p>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                {tiposServicio.map((tipo) => (
                  <label key={tipo.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-[#FBDAF9] transition-colors hover:bg-[#271033]">
                    <input
                      type="checkbox"
                      checked={serviciosPendientes.includes(tipo.id)}
                      onChange={() => onToggleServicio(tipo.id)}
                      className="h-4 w-4 rounded border-[#8D62A5] bg-[#271033] text-[#F500F1] accent-[#F500F1] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="truncate">{tipo.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {filtrosExtra.map((filtro) => (
              <div key={filtro.nombre} className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F500F1] border-b border-[#C392DD]/10 pb-1.5">{filtro.label}</p>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {filtro.opciones.map((opcion) => (
                    <label key={opcion.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-[#FBDAF9] transition-colors hover:bg-[#271033]">
                      <input
                        type="checkbox"
                        checked={(extrasPendientes[filtro.nombre] || []).includes(opcion.id)}
                        onChange={() => onToggleExtra(filtro.nombre, opcion.id)}
                        className="h-4 w-4 rounded border-[#8D62A5] bg-[#271033] text-[#F500F1] accent-[#F500F1] focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="truncate">{opcion.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#16051d] px-5 py-3 border-t border-[#C392DD]/10 flex justify-end">
            <button
              type="button"
              onClick={onAplicar}
              className="h-9 px-6 rounded-lg bg-gradient-to-r from-[#F500F1] to-[#D000CD] hover:from-[#d600d2] hover:to-[#b300b0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,0,241,0.3)] active:scale-[0.98] w-full sm:w-auto"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </details>
    </>
  );
}
