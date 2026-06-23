'use client';
import { useEffect, useRef, useState } from 'react';

type TipoServicio = {
  id: string;
  nombre: string;
  descripcion: string;
};

type Props = {
  value: string[];
  onChange: (tipos: string[]) => void;
  onAutoChange?: (tipos: string[]) => void;
};

export default function TiposServicioSelector({ value, onChange, onAutoChange }: Props) {
  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const debeSeleccionarInicial = useRef(value.length === 0);
  const onChangeRef = useRef(onChange);
  const onAutoChangeRef = useRef(onAutoChange);

  useEffect(() => {
    onChangeRef.current = onChange;
    onAutoChangeRef.current = onAutoChange;
  }, [onChange, onAutoChange]);

  useEffect(() => {
    fetch('/api/admin/tipos-servicio')
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const data = json.data;
        setTipos(data);
        if (debeSeleccionarInicial.current) {
          const tiposIniciales = data.map((t: TipoServicio) => t.id);
          if (onAutoChangeRef.current) {
            onAutoChangeRef.current(tiposIniciales);
          } else {
            onChangeRef.current(tiposIniciales);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando tipos de servicio:', err);
        setLoading(false);
      });
  }, []);

  const toggleTipo = (id: string) => {
    const nuevo = value.includes(id)
      ? value.filter((n) => n !== id)
      : [...value, id];
    onChange(nuevo);
  };

  const toggleTodos = () => {
    if (value.length === tipos.length) {
      onChange([]);
    } else {
      onChange(tipos.map((t) => t.id));
    }
  };

  if (loading) return <p className="text-[#8D62A5] text-sm">Cargando tipos de servicio...</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[#C392DD] text-sm font-semibold">Tipos de servicio</label>
        <button
          type="button"
          onClick={toggleTodos}
          className="text-xs text-[#C392DD] hover:text-white transition-colors"
        >
          {value.length === tipos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-[#271033] rounded-xl border border-[#8D62A5]">
        {tipos.map((tipo) => (
          <label
            key={tipo.id}
            className={`flex items-start gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
              value.includes(tipo.id)
                ? 'bg-[#1b0422] border border-[#F500F1]'
                : 'hover:bg-[#1b0422] border border-transparent'
            }`}
          >
            <input
              type="checkbox"
              checked={value.includes(tipo.id)}
              onChange={() => toggleTipo(tipo.id)}
              className="w-4 h-4 accent-[#F500F1] mt-0.5"
            />
            <div>
              <p className="text-white text-sm font-medium">{tipo.nombre}</p>
              <p className="text-[#8D62A5] text-xs">{tipo.descripcion}</p>
            </div>
          </label>
        ))}
      </div>

      {value.length === 0 && (
        <p className="text-red-400 text-xs">Seleccioná al menos un tipo de servicio.</p>
      )}
    </div>
  );
}
