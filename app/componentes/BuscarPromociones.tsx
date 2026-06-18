'use client';

import Link from 'next/link';
import { useBusqueda } from './BuscarPromociones/useBusqueda';
import { BarraBusqueda } from './BuscarPromociones/BarraBusqueda';
import { FiltroDropdown } from './BuscarPromociones/FiltroDropdown';

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

export default function BuscarPromociones({
  basePath,
  queryNombre,
  serviciosSeleccionados,
  tiposServicio,
  filtrosExtra = [],
  esAdmin = false,
}: Props) {
  const {
    query,
    setQuery,
    isPending,
    serviciosPendientes,
    extrasPendientes,
    ejecutarBusquedaTexto,
    aplicarFiltrosManuales,
    toggleServicioPendiente,
    toggleExtraPendiente,
  } = useBusqueda({ basePath, queryNombre, serviciosSeleccionados, filtrosExtra });

  const tieneFiltrosEnUrl = Boolean(
    queryNombre ||
      serviciosSeleccionados.length > 0 ||
      filtrosExtra.some((filtro) => filtro.seleccionados.length > 0)
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutarBusquedaTexto(query);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="mb-8 rounded-2xl border border-[#C392DD]/30 bg-gradient-to-b from-[#1b0422] to-[#120217] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] backdrop-blur-md"
    >
      <div className="flex flex-col lg:flex-row gap-4 w-full lg:items-end">
        <BarraBusqueda
          query={query}
          isPending={isPending}
          onChange={setQuery}
          onSubmit={handleFormSubmit}
        />

        <FiltroDropdown
          esAdmin={esAdmin}
          tiposServicio={tiposServicio}
          filtrosExtra={filtrosExtra}
          serviciosPendientes={serviciosPendientes}
          extrasPendientes={extrasPendientes}
          onToggleServicio={toggleServicioPendiente}
          onToggleExtra={toggleExtraPendiente}
          onAplicar={aplicarFiltrosManuales}
        />

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