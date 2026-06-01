type Props = {
  fechaInicio: string;
  tieneCaducidad: boolean;
  fechaFin: string;
  errorFechaFin?: string;
  onFechaInicio: (val: string) => void;
  onTieneCaducidad: (val: boolean) => void;
  onFechaFin: (val: string) => void;
  onBlurFechaFin: () => void;
  onLimpiarErrorFechaFin: () => void;
};

export default function CamposVigencia({
  fechaInicio, tieneCaducidad, fechaFin, errorFechaFin,
  onFechaInicio, onTieneCaducidad, onFechaFin, onBlurFechaFin, onLimpiarErrorFechaFin,
}: Props) {
  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-[#8D62A5]">
      <h3 className="text-[#C392DD] font-bold text-base">Vigencia por Fechas</h3>

      <div className="flex flex-col gap-1">
        <label className="text-[#FBDAF9] text-sm font-semibold">Fecha de Inicio</label>
        <input
          type="datetime-local"
          value={fechaInicio}
          onChange={(e) => onFechaInicio(e.target.value)}
          className="bg-[#271033] border border-[#8D62A5] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark]"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={tieneCaducidad}
          onChange={(e) => {
            onTieneCaducidad(e.target.checked);
            if (!e.target.checked) {
              onFechaFin('');
              onLimpiarErrorFechaFin();
            }
          }}
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
            onChange={(e) => onFechaFin(e.target.value)}
            onBlur={onBlurFechaFin}
            min={fechaInicio}
            className={`bg-[#271033] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F500F1] w-full [color-scheme:dark] ${errorFechaFin ? 'border-red-500' : 'border-[#8D62A5]'}`}
          />
          {errorFechaFin && <p className="text-red-400 text-xs mt-1">{errorFechaFin}</p>}
        </div>
      )}
    </div>
  );
}