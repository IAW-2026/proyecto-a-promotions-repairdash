import { FiltroUsuarios, Usuario } from './types';
import { tieneEspecificos } from '../hooks/useFiltroUsuarios';

type Props = {
  filtro: FiltroUsuarios;
  usuarios: Usuario[];
  usuariosFiltrados: Usuario[];
  busqueda: string;
  onBusqueda: (valor: string) => void;
  onToggleUsuario: (id: string) => void;
};

export function FiltroEspecificos({
  filtro,
  usuarios,
  usuariosFiltrados,
  busqueda,
  onBusqueda,
  onToggleUsuario,
}: Props) {
  const seleccionados = filtro.idsEspecificos?.length ?? 0;

  return (
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
          onChange={(e) => onBusqueda(e.target.value)}
          className="w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1]"
        />
      </div>

      {seleccionados > 0 && (
        <p className="text-[#F500F1] text-xs font-semibold">
          {seleccionados} usuario{seleccionados !== 1 ? 's' : ''} seleccionado{seleccionados !== 1 ? 's' : ''}
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
                onChange={() => onToggleUsuario(u.id)}
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
  );
}