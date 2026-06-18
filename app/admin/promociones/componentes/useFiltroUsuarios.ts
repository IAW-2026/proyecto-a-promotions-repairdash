import { useEffect, useState } from 'react';
import { FiltroUsuarios, Usuario, Modo, ErroresFiltro } from './types';

export function tieneCriterios(filtro: FiltroUsuarios): boolean {
  return !!(
    filtro.registradosDespuesDe ||
    filtro.registradosAntesDe ||
    filtro.minimoUsos !== undefined ||
    filtro.maximoUsos !== undefined
  );
}

export function tieneEspecificos(filtro: FiltroUsuarios): boolean {
  return !!(filtro.idsEspecificos && filtro.idsEspecificos.length > 0);
}

function detectarModo(value: FiltroUsuarios | null): Modo {
  if (!value) return 'todos';
  if (value.idsEspecificos && value.idsEspecificos.length > 0) return 'especificos';
  return 'filtros';
}

const erroresIniciales: ErroresFiltro = { despues: '', antes: '', usos: '' };

type Props = {
  value: FiltroUsuarios | null;
  onChange: (filtro: FiltroUsuarios | null) => void;
  onError: (hayError: boolean) => void;
};

export function useFiltroUsuarios({ value, onChange, onError }: Props) {
  const [modo, setModo] = useState<Modo>(() => detectarModo(value));
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroUsuarios>(value ?? {});
  const [confirmando, setConfirmando] = useState<Modo | null>(null);
  const [errores, setErrores] = useState<ErroresFiltro>(erroresIniciales);

  useEffect(() => {
    fetch('/api/admin/usuarios')
      .then((res) => res.json())
      .then((json) => setUsuarios(json.data));
  }, []);

  useEffect(() => {
    if (modo === 'todos') {
      onError(false);
      return;
    }
    const hayErroresInternos = Object.values(errores).some((e) => e !== '');
    if (modo === 'filtros') {
      onError(hayErroresInternos || !tieneCriterios(filtro));
      return;
    }
    if (modo === 'especificos') {
      onError(hayErroresInternos || !tieneEspecificos(filtro));
    }
  }, [modo, filtro, errores]);

  const actualizarErrores = (nuevos: Partial<ErroresFiltro>) => {
    setErrores((prev) => ({ ...prev, ...nuevos }));
  };

  const actualizar = (cambios: Partial<FiltroUsuarios>) => {
    const nuevo = { ...filtro, ...cambios };
    setFiltro(nuevo);
    onChange(nuevo);
  };

  const toggleUsuario = (id: string) => {
    const ids = filtro.idsEspecificos ?? [];
    const nuevo = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
    actualizar({ idsEspecificos: nuevo.length > 0 ? nuevo : undefined });
  };

  const aplicarCambioModo = (nuevoModo: Modo) => {
    setModo(nuevoModo);
    setFiltro({});
    setBusqueda('');
    setConfirmando(null);
    setErrores(erroresIniciales);
    onChange(nuevoModo === 'todos' ? null : {});
  };

  const cancelarConfirmacion = () => setConfirmando(null);

  const handleModo = (nuevoModo: Modo) => {
    if (nuevoModo === modo) return;
    const hayDatosEnModoActual =
      (modo === 'filtros' && tieneCriterios(filtro)) ||
      (modo === 'especificos' && tieneEspecificos(filtro));
    if (hayDatosEnModoActual) {
      setConfirmando(nuevoModo);
      return;
    }
    aplicarCambioModo(nuevoModo);
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.id.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mensajeConfirmacion = () => {
    if (modo === 'filtros') return 'Tenés filtros cargados. Si cambiás de opción se van a perder.';
    if (modo === 'especificos') {
      const cant = filtro.idsEspecificos?.length ?? 0;
      return `Tenés ${cant} usuario${cant !== 1 ? 's' : ''} seleccionado${cant !== 1 ? 's' : ''}. Si cambiás de opción se va a perder la selección.`;
    }
    return '';
  };

  return {
    modo,
    usuarios,
    usuariosFiltrados,
    busqueda,
    setBusqueda,
    filtro,
    confirmando,
    errores,
    handleModo,
    aplicarCambioModo,
    cancelarConfirmacion,
    actualizar,
    actualizarErrores,
    toggleUsuario,
    mensajeConfirmacion,
  };
}