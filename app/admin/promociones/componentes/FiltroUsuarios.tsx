'use client';
import { useEffect, useState } from 'react';

type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

type Usuario = {
  id: string;
  nombre: string;
  fechaRegistro: string;
};

type Props = {
  value: FiltroUsuarios | null;
  onChange: (filtro: FiltroUsuarios | null) => void;
  onError: (hayError: boolean) => void;
};

type Modo = 'todos' | 'filtros' | 'especificos';

function detectarModo(value: FiltroUsuarios | null): Modo {
  if (!value) return 'todos';
  if (value.idsEspecificos && value.idsEspecificos.length > 0) return 'especificos';
  return 'filtros';
}

function tieneCriterios(filtro: FiltroUsuarios): boolean {
  return !!(
    filtro.registradosDespuesDe ||
    filtro.registradosAntesDe ||
    filtro.minimoUsos !== undefined ||
    filtro.maximoUsos !== undefined
  );
}

function tieneEspecificos(filtro: FiltroUsuarios): boolean {
  return !!(filtro.idsEspecificos && filtro.idsEspecificos.length > 0);
}

export default function FiltroUsuariosSelector({ value, onChange, onError }: Props) {
  const [modo, setModo] = useState<Modo>(() => detectarModo(value));
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroUsuarios>(value ?? {});
  const [confirmando, setConfirmando] = useState<Modo | null>(null);
  const [errores, setErrores] = useState({ despues: '', antes: '', usos: '' });

  useEffect(() => {
    fetch('/api/admin/usuarios')
      .then((res) => res.json())
      .then(setUsuarios);
  }, []);

  // Validación de modo sin criterios
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
      return;
    }
  }, [modo, filtro, errores]);

  const actualizarErrores = (nuevos: Partial<typeof errores>) => {
    const merged = { ...errores, ...nuevos };
    setErrores(merged);
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

  const aplicarCambioModo = (nuevoModo: Modo) => {
    setModo(nuevoModo);
    setFiltro({});
    setBusqueda('');
    setConfirmando(null);
    setErrores({ despues: '', antes: '', usos: '' });
    onChange(nuevoModo === 'todos' ? null : {});
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.id.toLowerCase().includes(busqueda.toLowerCase())
  );

  const modos: { key: Modo; label: string }[] = [
    { key: 'todos', label: 'Para todos' },
    { key: 'filtros', label: 'Por filtros' },
    { key: 'especificos', label: 'Usuarios específicos' },
  ];

  const mensajeConfirmacion = () => {
    if (modo === 'filtros') return 'Tenés filtros cargados. Si cambiás de opción se van a perder.';
    if (modo === 'especificos') {
      const cant = filtro.idsEspecificos?.length ?? 0;
      return `Tenés ${cant} usuario${cant !== 1 ? 's' : ''} seleccionado${cant !== 1 ? 's' : ''}. Si cambiás de opción se va a perder la selección.`;
    }
    return '';
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[#C392DD] text-sm font-semibold">¿Para qué usuarios aplica esta promoción?</label>

      <div className="flex gap-2 flex-wrap">
        {modos.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleModo(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              modo === key
                ? 'bg-[#F500F1] text-white'
                : 'bg-[#271033] border border-[#8D62A5] text-[#FBDAF9] hover:border-[#F500F1]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {confirmando && (
        <div className="flex flex-col gap-3 p-4 bg-[#1b0422] rounded-xl border border-[#F500F1]">
          <p className="text-[#FBDAF9] text-sm">{mensajeConfirmacion()}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => aplicarCambioModo(confirmando)}
              className="px-4 py-2 bg-[#F500F1] text-white rounded-lg text-sm font-semibold hover:bg-[#c400c0] transition-colors"
            >
              Sí, cambiar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(null)}
              className="px-4 py-2 bg-[#271033] border border-[#8D62A5] text-[#FBDAF9] rounded-lg text-sm hover:border-[#F500F1] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modo === 'filtros' && (
        <div className="flex flex-col gap-4 p-4 bg-[#271033] rounded-xl border border-[#8D62A5]">
          {!tieneCriterios(filtro) && (
            <p className="text-red-400 text-xs">Tenés que definir al menos un criterio de filtro.</p>
          )}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 w-full md:flex-1">
              <label className="text-[#C392DD] text-xs font-semibold">Registrados después de</label>
              <input
                type="date"
                value={filtro.registradosDespuesDe ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    actualizar({ registradosDespuesDe: undefined });
                    actualizarErrores({ despues: '' });
                    return;
                  }
                  if (val.length < 10) {
                    actualizar({ registradosDespuesDe: undefined });
                    actualizarErrores({ despues: 'Fecha incompleta, no se guardará.' });
                    return;
                  }
                  if (filtro.registradosAntesDe && val > filtro.registradosAntesDe) {
                    actualizar({ registradosDespuesDe: val });
                    actualizarErrores({ despues: 'La fecha mínima no puede ser posterior a la máxima.' });
                    return;
                  }
                  actualizar({ registradosDespuesDe: val });
                  actualizarErrores({ despues: '', antes: errores.antes === 'La fecha máxima no puede ser anterior a la mínima.' ? '' : errores.antes });
                }}
                className="w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1] [color-scheme:dark]"
              />
              {errores.despues && <p className="text-red-400 text-xs">{errores.despues}</p>}
            </div>

            <div className="flex flex-col gap-1 w-full md:flex-1">
              <label className="text-[#C392DD] text-xs font-semibold">Registrados antes de</label>
              <input
                type="date"
                value={filtro.registradosAntesDe ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    actualizar({ registradosAntesDe: undefined });
                    actualizarErrores({ antes: '' });
                    return;
                  }
                  if (val.length < 10) {
                    actualizar({ registradosAntesDe: undefined });
                    actualizarErrores({ antes: 'Fecha incompleta, no se guardará.' });
                    return;
                  }
                  if (filtro.registradosDespuesDe && val < filtro.registradosDespuesDe) {
                    actualizar({ registradosAntesDe: val });
                    actualizarErrores({ antes: 'La fecha máxima no puede ser anterior a la mínima.' });
                    return;
                  }
                  actualizar({ registradosAntesDe: val });
                  actualizarErrores({ antes: '', despues: errores.despues === 'La fecha mínima no puede ser posterior a la máxima.' ? '' : errores.despues });
                }}
                className="w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1] [color-scheme:dark]"
              />
              {errores.antes && <p className="text-red-400 text-xs">{errores.antes}</p>}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 w-full md:flex-1">
              <label className="text-[#C392DD] text-xs font-semibold">Mínimo de promociones usadas</label>
              <input
                type="number"
                min={0}
                value={filtro.minimoUsos ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  actualizar({ minimoUsos: val });
                  if (val !== undefined && filtro.maximoUsos !== undefined && val > filtro.maximoUsos) {
                    actualizarErrores({ usos: 'El mínimo no puede ser mayor al máximo.' });
                  } else {
                    actualizarErrores({ usos: '' });
                  }
                }}
                className="w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1]"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:flex-1">
              <label className="text-[#C392DD] text-xs font-semibold">Máximo de promociones usadas</label>
              <input
                type="number"
                min={0}
                value={filtro.maximoUsos ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  actualizar({ maximoUsos: val });
                  if (val !== undefined && filtro.minimoUsos !== undefined && val < filtro.minimoUsos) {
                    actualizarErrores({ usos: 'El máximo no puede ser menor al mínimo.' });
                  } else {
                    actualizarErrores({ usos: '' });
                  }
                }}
                className="w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1]"
              />
            </div>
          </div>
          {errores.usos && <p className="text-red-400 text-xs">{errores.usos}</p>}
        </div>
      )}

      {modo === 'especificos' && (
        <div className="flex flex-col gap-3 p-4 bg-[#271033] rounded-xl border border-[#8D62A5]">
          {!tieneEspecificos(filtro) && (
            <p className="text-red-400 text-xs">Tenés que seleccionar al menos un usuario.</p>
          )}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D62A5]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1]"
            />
          </div>

          {(filtro.idsEspecificos?.length ?? 0) > 0 && (
            <p className="text-[#F500F1] text-xs font-semibold">
              {filtro.idsEspecificos!.length} usuario{filtro.idsEspecificos!.length !== 1 ? 's' : ''} seleccionado{filtro.idsEspecificos!.length !== 1 ? 's' : ''}
            </p>
          )}

          {usuarios.length === 0 ? (
            <p className="text-[#8D62A5] text-sm">No hay usuarios registrados.</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p className="text-[#8D62A5] text-sm">No se encontraron usuarios.</p>
          ) : (
            <div className="flex flex-col gap-1 min-h-24 h-52 overflow-y-auto pr-1">
              {usuariosFiltrados.map((u) => (
                <label
                  key={u.id}
                  className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                    filtro.idsEspecificos?.includes(u.id)
                      ? 'bg-[#1b0422] border border-[#F500F1]'
                      : 'hover:bg-[#1b0422] border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filtro.idsEspecificos?.includes(u.id) ?? false}
                    onChange={() => toggleUsuario(u.id)}
                    className="w-4 h-4 accent-[#F500F1]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.nombre}</p>
                    <p className="text-[#8D62A5] text-xs">
                      Registrado: {new Date(u.fechaRegistro).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}