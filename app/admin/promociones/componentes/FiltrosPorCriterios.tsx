import { FiltroUsuarios, ErroresFiltro } from './types';
import { tieneCriterios } from '../hooks/useFiltroUsuarios';

type Props = {
  filtro: FiltroUsuarios;
  errores: ErroresFiltro;
  onActualizar: (cambios: Partial<FiltroUsuarios>) => void;
  onActualizarErrores: (nuevos: Partial<ErroresFiltro>) => void;
};

const inputClase = 'w-full bg-[#1b0422] border border-[#8D62A5] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F500F1]';

export function FiltrosPorCriterios({ filtro, errores, onActualizar, onActualizarErrores }: Props) {
  const handleDespues = (val: string) => {
    if (!val) {
      onActualizar({ registradosDespuesDe: undefined });
      onActualizarErrores({ despues: '' });
      return;
    }
    if (val.length < 10) {
      onActualizar({ registradosDespuesDe: undefined });
      onActualizarErrores({ despues: 'Fecha incompleta, no se guardará.' });
      return;
    }
    if (filtro.registradosAntesDe && val > filtro.registradosAntesDe) {
      onActualizar({ registradosDespuesDe: val });
      onActualizarErrores({ despues: 'La fecha mínima no puede ser posterior a la máxima.' });
      return;
    }
    onActualizar({ registradosDespuesDe: val });
    onActualizarErrores({
      despues: '',
      antes: errores.antes === 'La fecha máxima no puede ser anterior a la mínima.' ? '' : errores.antes,
    });
  };

  const handleAntes = (val: string) => {
    if (!val) {
      onActualizar({ registradosAntesDe: undefined });
      onActualizarErrores({ antes: '' });
      return;
    }
    if (val.length < 10) {
      onActualizar({ registradosAntesDe: undefined });
      onActualizarErrores({ antes: 'Fecha incompleta, no se guardará.' });
      return;
    }
    if (filtro.registradosDespuesDe && val < filtro.registradosDespuesDe) {
      onActualizar({ registradosAntesDe: val });
      onActualizarErrores({ antes: 'La fecha máxima no puede ser anterior a la mínima.' });
      return;
    }
    onActualizar({ registradosAntesDe: val });
    onActualizarErrores({
      antes: '',
      despues: errores.despues === 'La fecha mínima no puede ser posterior a la máxima.' ? '' : errores.despues,
    });
  };

  const handleMinUsos = (val: string) => {
    const num = val ? parseInt(val) : undefined;
    onActualizar({ minimoUsos: num });
    if (num !== undefined && filtro.maximoUsos !== undefined && num > filtro.maximoUsos) {
      onActualizarErrores({ usos: 'El mínimo no puede ser mayor al máximo.' });
    } else {
      onActualizarErrores({ usos: '' });
    }
  };

  const handleMaxUsos = (val: string) => {
    const num = val ? parseInt(val) : undefined;
    onActualizar({ maximoUsos: num });
    if (num !== undefined && filtro.minimoUsos !== undefined && num < filtro.minimoUsos) {
      onActualizarErrores({ usos: 'El máximo no puede ser menor al mínimo.' });
    } else {
      onActualizarErrores({ usos: '' });
    }
  };

  return (
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
            onChange={(e) => handleDespues(e.target.value)}
            className={`${inputClase} [color-scheme:dark]`}
          />
          {errores.despues && <p className="text-red-400 text-xs">{errores.despues}</p>}
        </div>

        <div className="flex flex-col gap-1 w-full md:flex-1">
          <label className="text-[#C392DD] text-xs font-semibold">Registrados antes de</label>
          <input
            type="date"
            value={filtro.registradosAntesDe ?? ''}
            onChange={(e) => handleAntes(e.target.value)}
            className={`${inputClase} [color-scheme:dark]`}
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
            onChange={(e) => handleMinUsos(e.target.value)}
            className={inputClase}
          />
        </div>

        <div className="flex flex-col gap-1 w-full md:flex-1">
          <label className="text-[#C392DD] text-xs font-semibold">Máximo de promociones usadas</label>
          <input
            type="number"
            min={0}
            value={filtro.maximoUsos ?? ''}
            onChange={(e) => handleMaxUsos(e.target.value)}
            className={inputClase}
          />
        </div>
      </div>

      {errores.usos && <p className="text-red-400 text-xs">{errores.usos}</p>}
    </div>
  );
}