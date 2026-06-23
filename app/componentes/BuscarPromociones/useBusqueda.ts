'use client';

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
  filtrosExtra: FiltroExtra[];
};

export function useBusqueda({ basePath, queryNombre, serviciosSeleccionados, filtrosExtra }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLocalChange = useRef(false);

  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(queryNombre);
  const [serviciosPendientes, setServiciosPendientes] = useState<string[]>(serviciosSeleccionados);
  const [extrasPendientes, setExtrasPendientes] = useState<Record<string, string[]>>(() => {
    const inicial: Record<string, string[]> = {};
    filtrosExtra.forEach((f) => {
      inicial[f.nombre] = f.seleccionados;
    });
    return inicial;
  });

  const stringServiciosUrl = serviciosSeleccionados.join(',');
  const stringExtrasUrl = JSON.stringify(filtrosExtra.map((f) => `${f.nombre}:${f.seleccionados.join('-')}`));

  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    setQuery(queryNombre);
    setServiciosPendientes(serviciosSeleccionados);

    const inicial: Record<string, string[]> = {};
    filtrosExtra.forEach((f) => {
      inicial[f.nombre] = f.seleccionados;
    });
    setExtrasPendientes(inicial);
  }, [queryNombre, stringServiciosUrl, stringExtrasUrl]);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const ejecutarBusquedaTexto = (valorTexto: string) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
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

  const aplicarFiltrosManuales = (onAplicado?: () => void) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.delete('page');

    params.delete('servicio');
    serviciosPendientes.filter(Boolean).forEach((item) => params.append('servicio', item));

    filtrosExtra.forEach((filtro) => {
      params.delete(filtro.nombre);
      const seleccionados = extrasPendientes[filtro.nombre] || [];
      seleccionados.filter(Boolean).forEach((item) => params.append(filtro.nombre, item));
    });

    const nuevaUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;

    startTransition(() => {
      router.replace(nuevaUrl, { scroll: false });
    });

    onAplicado?.();
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

  return {
    query,
    setQuery,
    isPending,
    serviciosPendientes,
    extrasPendientes,
    ejecutarBusquedaTexto,
    aplicarFiltrosManuales,
    toggleServicioPendiente,
    toggleExtraPendiente,
  };
}