// app/componentes/HistorialTabla.tsx

type ItemHistorial = {
  id: number;
  nombre: string;
  fechaUso: string;
  valorPagado: number;
  valorOriginal: number;
  trabajoId: number;
  usuarioId?: string;
};

type Props = {
  historial: ItemHistorial[];
  mostrarUsuario?: boolean;
  paginacion?: React.ReactNode;
};

function abreviarId(id: string) {
  return `...${id.slice(-6)}`;
}

export default function HistorialTabla({ historial, mostrarUsuario = false, paginacion }: Props) {
  const colsHeader = mostrarUsuario
    ? 'grid-cols-[1.2fr_2.1fr_1fr_1fr_1fr_1fr_1fr]'
    : 'grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]';

  const colsRow = mostrarUsuario
    ? 'grid-cols-[1.0fr_2.4fr_0.8fr_1fr_1fr_1fr_1fr]'
    : 'grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]';

  const columnas = mostrarUsuario
    ? ['Usuario', 'Promoción', 'Trabajo', 'Fecha', 'Original', 'Pagó', 'Ahorró']
    : ['Promoción', 'Trabajo', 'Fecha', 'Precio original', 'Pagaste', 'Ahorraste'];

  return (
    <>
      {/* Tabla Desktop */}
      <div className="hidden md:flex flex-col gap-3 overflow-x-auto">
        <div className={`grid ${colsHeader} px-6 py-3 min-w-[900px]`}>
          {columnas.map((col) => (
            <span key={col} className="text-[#C392DD] text-sm font-semibold">{col}</span>
          ))}
        </div>

        {historial.map((item) => (
          <div
            key={item.id}
            className={`grid ${colsRow} px-6 py-4 items-center bg-[#8D62A5] rounded-2xl border border-[#C392DD] min-w-[900px] ${!mostrarUsuario ? 'hover:border-[#F500F1] transition-colors' : ''}`}
          >
            {mostrarUsuario && (
              <span className="text-[#FBDAF9] text-xs font-mono" title={item.usuarioId}>
                {abreviarId(item.usuarioId!)}
              </span>
            )}
            <span className="text-white font-extrabold">{item.nombre}</span>
            <span className="text-[#C392DD] font-semibold">#{item.trabajoId}</span>
            <span className="text-[#FBDAF9] text-sm">{item.fechaUso}</span>
            <span className="text-[#FBDAF9] line-through">${item.valorOriginal.toLocaleString('es-AR')}</span>
            <span className="text-white font-bold">${item.valorPagado.toLocaleString('es-AR')}</span>
            <span className="text-white font-extrabold">${(item.valorOriginal - item.valorPagado).toLocaleString('es-AR')}</span>
          </div>
        ))}
      </div>

      {/* Cards Mobile */}
      <div className="flex flex-col gap-4 md:hidden">
        {historial.map((item) => (
          <div key={item.id} className="p-5 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-extrabold text-xl">{item.nombre}</h3>
                <span className="text-s text-[#FBDAF9]">{item.fechaUso}</span>
              </div>
              {mostrarUsuario ? (
                <span className="text-xs text-[#C392DD] font-mono">ID: {item.usuarioId}</span>
              ) : (
                <span className="text-[#FBDAF9] text-xs">
                  Trabajo <span className="font-semibold text-[#C392DD]">#{item.trabajoId}</span>
                </span>
              )}
            </div>
            <div className="flex justify-between pt-3 border-t border-[#C392DD]">
              <div>
                <p className="text-[#FBDAF9] text-[10px]">Original</p>
                <p className="text-[#FBDAF9] line-through text-xs">${item.valorOriginal.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-[#FBDAF9] text-[10px]">Pagó</p>
                <p className="text-white font-bold">${item.valorPagado.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-[#FBDAF9] text-[10px]">Ahorró</p>
                <p className="text-white font-extrabold">${(item.valorOriginal - item.valorPagado).toLocaleString('es-AR')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paginacion}
    </>
  );
}