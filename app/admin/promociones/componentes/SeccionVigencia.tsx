// app/admin/promociones/componentes/SeccionVigencia.tsx

type Props = {
  fechaInicio: string;
  fechaFin: string;
  tieneCaducidad: boolean;
  errorFechaFin?: string;
  onChangeFechaInicio: (v: string) => void;
  onChangeFechaFin: (v: string) => void;
  onChangeTieneCaducidad: (v: boolean) => void;
  onBlurFechaFin: () => void;
};

const inputClase = (error?: string) =>
  `bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark] ${
    error ? 'border-red-500' : 'border-[#8D62A5]'
  }`;

export function SeccionVigencia({
  fechaInicio,
  fechaFin,
  tieneCaducidad,
  errorFechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
  onChangeTieneCaducidad,
  onBlurFechaFin,
}: Props) {
  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-[#8D62A5]">
      <h3 className="text-[#C392DD] font-bold text-base">Vigencia por Fechas</h3>

      <div className="flex flex-col gap-1">
        <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Inicio</label>
        <input
          type="datetime-local"
          value={fechaInicio}
          onChange={(e) => onChangeFechaInicio(e.target.value)}
          className={inputClase()}
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={tieneCaducidad}
          onChange={(e) => onChangeTieneCaducidad(e.target.checked)}
          className="w-4 h-4 accent-[#F500F1]"
        />
        <span className="text-[#FBDAF9] text-sm">¿Esta promoción tiene fecha de vencimiento?</span>
      </label>

      {tieneCaducidad && (
        <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#8D62A5]">
          <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Finalización*</label>
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => onChangeFechaFin(e.target.value)}
            onBlur={onBlurFechaFin}
            min={fechaInicio}
            className={inputClase(errorFechaFin)}
          />
          {errorFechaFin && <p className="text-red-400 text-xs mt-1">{errorFechaFin}</p>}
        </div>
      )}
    </div>
  );
}