'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import FiltrosPromocionesDropdown, { type FiltroExtra, type OpcionFiltro } from './FiltrosPromocionesDropdown';

type Props = {
  basePath: string;
  queryNombre: string;
  serviciosSeleccionados: string[];
  tiposServicio: OpcionFiltro[];
  filtrosExtra?: FiltroExtra[];
  esAdmin?: boolean;
};

function extrasIniciales(filtrosExtra: FiltroExtra[]) {
  const inicial: Record<string, string[]> = {};
  filtrosExtra.forEach((filtro) => {
    inicial[filtro.nombre] = filtro.seleccionados;
  });
  return inicial;
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
  const searchParamsRef = useRef(searchParams);

  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(queryNombre);
  const [serviciosPendientes, setServiciosPendientes] = useState<string[]>(serviciosSeleccionados);
  const [extrasPendientes, setExtrasPendientes] = useState<Record<string, string[]>>(() =>
    extrasIniciales(filtrosExtra)
  );

  const stringServiciosUrl = serviciosSeleccionados.join(',');
  const stringExtrasUrl = JSON.stringify(filtrosExtra.map((filtro) => `${filtro.nombre}:${filtro.seleccionados.join('-')}`));

  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }

    setQuery(queryNombre);
    setServiciosPendientes(serviciosSeleccionados);
    setExtrasPendientes(extrasIniciales(filtrosExtra));
  }, [queryNombre, stringServiciosUrl, stringExtrasUrl, filtrosExtra, serviciosSeleccionados]);

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

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const navegar = useCallback((url: string) => {
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }, [router]);

  const ejecutarBusquedaTexto = useCallback((valorTexto: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (!valorTexto.trim()) {
      params.delete('q');
    } else {
      params.set('q', valorTexto.trim());
    }

    const nuevaUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    isLocalChange.current = true;
    navegar(nuevaUrl);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [basePath, navegar, searchParams]);

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

    const nuevaUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    navegar(nuevaUrl);
    detailsRef.current?.removeAttribute('open');
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      const urlQuery = searchParamsRef.current.get('q') ?? '';
      if (urlQuery !== query.trim()) {
        ejecutarBusquedaTexto(query);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [ejecutarBusquedaTexto, query]);

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
          <FiltrosPromocionesDropdown
            esAdmin={esAdmin}
            detailsRef={detailsRef}
            tiposServicio={tiposServicio}
            serviciosPendientes={serviciosPendientes}
            filtrosExtra={filtrosExtra}
            extrasPendientes={extrasPendientes}
            onToggleServicio={toggleServicioPendiente}
            onToggleExtra={toggleExtraPendiente}
            onAplicar={aplicarFiltrosManuales}
          />
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
