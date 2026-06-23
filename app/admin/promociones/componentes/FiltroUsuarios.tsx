'use client';

import { FiltroUsuarios } from './types';
import { useFiltroUsuarios } from '../hooks/useFiltroUsuarios';
import { ModoSelector } from './ModoSelector';
import { FiltrosPorCriterios } from './FiltrosPorCriterios';
import { FiltroEspecificos } from './FiltroEspecificos';

type Props = {
  value: FiltroUsuarios | null;
  onChange: (filtro: FiltroUsuarios | null) => void;
  onError: (hayError: boolean) => void;
};

export default function FiltroUsuariosSelector({ value, onChange, onError }: Props) {
  const {
    modo, usuarios, usuariosFiltrados,
    busqueda, setBusqueda, filtro, confirmando,
    errores, handleModo, aplicarCambioModo, cancelarConfirmacion,
    actualizar, actualizarErrores, toggleUsuario, mensajeConfirmacion,
  } = useFiltroUsuarios({ value, onChange, onError });

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[#C392DD] text-sm font-semibold">
        ¿Para qué usuarios aplica esta promoción?
      </label>

      <ModoSelector
        modo={modo}
        confirmando={confirmando}
        mensajeConfirmacion={mensajeConfirmacion()}
        onCambiarModo={handleModo}
        onConfirmar={() => aplicarCambioModo(confirmando!)}
        onCancelarConfirmacion={cancelarConfirmacion}
      />

      {modo === 'filtros' && (
        <FiltrosPorCriterios
          filtro={filtro}
          errores={errores}
          onActualizar={actualizar}
          onActualizarErrores={actualizarErrores}
        />
      )}

      {modo === 'especificos' && (
        <FiltroEspecificos
          filtro={filtro}
          usuarios={usuarios}
          usuariosFiltrados={usuariosFiltrados}
          busqueda={busqueda}
          onBusqueda={setBusqueda}
          onToggleUsuario={toggleUsuario}
        />
      )}
    </div>
  );
}