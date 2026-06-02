'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

type OpcionFiltro = {
  id: string;
  nombre: string;
};

type FiltroExtra = {
  nombre: string;
  label: string;
  opciones: OpcionFiltro[];
  seleccionados: string[];
};

type Props = {
  basePath: string;
  queryNombre: string;
  serviciosSeleccionados: string[];
  tiposServicio: OpcionFiltro[];
  filtrosExtra?: FiltroExtra[];
  esAdmin?: boolean;
};

function resumen(seleccionados: string[], opciones: OpcionFiltro[]) {
  if (seleccionados.length === 0) return 'Todos los servicios';
  if (seleccionados.length === 1) {
    return opciones.find((opcion) => opcion.id === seleccionados[0])?.nombre ?? '1 seleccionado';
  }
  return `${seleccionados.length} seleccionados`;
}

export default function BuscarPromociones({
  basePath,
  queryNombre,
  serviciosSeleccionados,
  tiposServicio,
  filtrosExtra = [],
  esAdmin = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const isLocalChange = useRef(false);

  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(queryNombre);

  const [serviciosPendientes, setServiciosPendientes] = useState<string[]>(serviciosSeleccionados);
  const [extrasPendientes, setExtrasPendientes] = useState<Record<string, string[]>>(() => {
    const inicial: Record<string, string[]> = {};
    filtrosExtra.forEach(f => {
      inicial[f.nombre] = f.seleccionados;
    });
    return inicial;
  });

  const stringServiciosUrl = serviciosSeleccionados.join(',');
  const stringExtrasUrl = JSON.stringify(filtrosExtra.map(f => `${f.nombre}:${f.seleccionados.join('-')}`));

  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    setQuery(queryNombre);
    setServiciosPendientes(serviciosSeleccionados);
    
    const inicial: Record<string, string[]> = {};
    filtrosExtra.forEach(f => {
      inicial[f.nombre] = f.seleccionados;
    });
    setExtrasPendientes(inicial);
  }, [queryNombre, stringServiciosUrl, stringExtrasUrl]);

  useEffect(() => {
    const escucharClickAfuera = (evento: MouseEvent) => {
      if (
        detailsRef.current &&
        detailsRef.current.hasAttribute('open') &&
        !detailsRef.current.contains(evento.target as Node)
      ) {
        detailsRef.current.removeAttribute('open');
      }
    };

    document.addEventListener('click', escucharClickAfuera);
    return () => {
      document.removeEventListener('click', escucharClickAfuera);
    };
  }, []);

  const ejecutarBusquedaTexto = (valorTexto: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (!valorTexto.trim()) {
      params.delete('q');
    } else {
      params.set('q', valorTexto.trim());
    }

    const nuevaUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    isLocalChange.current = true;
    
    startTransition(() => {
      router.replace(nuevaUrl, { scroll: false });
    });

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutarBusquedaTexto(query);
  };

  const aplicarFiltrosManuales = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    params.delete('servicio');
    serviciosPendientes.filter(Boolean).forEach((item) => params.append('servicio', item));

    filtrosExtra.forEach((filtro) => {
      params.delete(filtro.nombre);
      const seleccionados = extrasPendientes[filtro.nombre] || [];
      seleccionados.filter(Boolean).forEach((item) => params.append(filtro.nombre, item));
    });

    const queryString = params.toString();
    const nuevaUrl = queryString ? `${basePath}?${queryString}` : basePath;

    startTransition(() => {
      router.replace(nuevaUrl, { scroll: false });
    });

    if (detailsRef.current) {
      detailsRef.current.removeAttribute('open');
    }
  };

  const toggleServicioPendiente = (id: string) => {
    setServiciosPendientes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExtraPendiente = (nombreFiltro: string, id: string) => {
    setExtrasPendientes((prev) => {
      const actuales = prev[nombreFiltro] || [];
      const nuevos = actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id];
      return { ...prev, [nombreFiltro]: nuevos };
    });
  };

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const urlQuery = searchParamsRef.current.get('q') ?? '';
      if (urlQuery !== query.trim()) {
        ejecutarBusquedaTexto(query);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, basePath]);

  const tieneFiltrosEnUrl = Boolean(
    queryNombre ||
      serviciosSeleccionados.length > 0 ||
      filtrosExtra.some((filtro) => filtro.seleccionados.length > 0)
  );

  return (
    <form onSubmit={handleFormSubmit} className="mb-8 rounded-2xl border border-[#C392DD]/30 bg-gradient-to-b from-[#1b0422] to-[#120217] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] backdrop-blur-md">
      <div className="flex flex-col lg:flex-row gap-4 w-full lg:items-end">
        
        <div className="flex flex-col gap-1.5 flex-1 lg:flex-[1.5] w-full">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#C392DD]/80 flex items-center gap-2">
            Buscar Promoción
            {isPending && (
              <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-[#F500F1]" />
            )}
          </label>
          <div className="relative flex items-center w-full">
            <svg className="absolute left-3.5 h-4 w-4 text-[#8D62A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              enterKeyHint="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Escribí para buscar..."
              className="h-11 w-full rounded-xl border border-[#8D62A5]/40 bg-[#271033]/60 pl-10 pr-12 text-sm text-white outline-none transition-all placeholder:text-[#8D62A5]/70 focus:border-[#F500F1] focus:bg-[#271033] focus:shadow-[0_0_15px_rgba(245,0,241,0.15)]"
            />
            
            {query.trim().length > 0 && (
              <button
                type="submit"
                className="absolute right-2 flex h-7 w-8 items-center justify-center rounded-lg bg-[#F500F1] text-white hover:bg-[#c400c0] transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-150"
                title="Buscar ahora"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 lg:flex-[2] w-full">
          {esAdmin ? (
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
                              onChange={() => toggleServicioPendiente(tipo.id)}
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
                                onChange={() => toggleExtraPendiente(filtro.nombre, opcion.id)}
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
                      onClick={aplicarFiltrosManuales}
                      className="h-9 px-6 rounded-lg bg-gradient-to-r from-[#F500F1] to-[#D000CD] hover:from-[#d600d2] hover:to-[#b300b0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,0,241,0.3)] active:scale-[0.98] w-full sm:w-auto"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </details>
            </>
          ) : (
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
                  <div className="p-3 pt-11">
                    <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {tiposServicio.map((tipo) => (
                        <label key={tipo.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#FBDAF9] transition-colors hover:bg-[#271033]">
                          <input
                            type="checkbox"
                            checked={serviciosPendientes.includes(tipo.id)}
                            onChange={() => toggleServicioPendiente(tipo.id)}
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
                      onClick={aplicarFiltrosManuales}
                      className="w-full h-9 rounded-lg bg-gradient-to-r from-[#F500F1] to-[#D000CD] hover:from-[#d600d2] hover:to-[#b300b0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,0,241,0.25)] active:scale-[0.98]"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>
              </details>
            </>
          )}
        </div>

        {tieneFiltrosEnUrl && (
          <div className="w-full lg:w-auto shrink-0 animate-in fade-in duration-150">
            <Link
              href={basePath}
              className="flex h-11 items-center justify-center rounded-xl border border-[#C392DD]/40 bg-[#271033]/30 px-6 text-xs font-bold uppercase tracking-wider text-[#C392DD] transition-all hover:border-[#C392DD] hover:bg-[#C392DD] hover:text-white hover:shadow-[0_0_15px_rgba(195,146,221,0.2)] w-full lg:w-auto"
            >
              Limpiar
            </Link>
          </div>
        )}

      </div>
    </form>
  );
}