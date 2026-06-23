import { Modo } from './types';

const MODOS: { key: Modo; label: string }[] = [
  { key: 'todos', label: 'Para todos' },
  { key: 'filtros', label: 'Por filtros' },
  { key: 'especificos', label: 'Usuarios específicos' },
];

type Props = {
  modo: Modo;
  confirmando: Modo | null;
  mensajeConfirmacion: string;
  onCambiarModo: (modo: Modo) => void;
  onConfirmar: () => void;
  onCancelarConfirmacion: () => void;
};

export function ModoSelector({
  modo,
  confirmando,
  mensajeConfirmacion,
  onCambiarModo,
  onConfirmar,
  onCancelarConfirmacion,
}: Props) {
  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {MODOS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onCambiarModo(key)}
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
          <p className="text-[#FBDAF9] text-sm">{mensajeConfirmacion}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onConfirmar}
              className="px-4 py-2 bg-[#F500F1] text-white rounded-lg text-sm font-semibold hover:bg-[#c400c0] transition-colors"
            >
              Sí, cambiar
            </button>
            <button
              type="button"
              onClick={onCancelarConfirmacion}
              className="px-4 py-2 bg-[#271033] border border-[#8D62A5] text-[#FBDAF9] rounded-lg text-sm hover:border-[#F500F1] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}