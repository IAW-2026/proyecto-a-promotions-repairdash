type ItemHistorial = {
  id: number;
  nombre: string;
  fechaUso: string;
  valorPagado: number;
  valorOriginal: number;
};

const MAX_VISIBLE = 3;

export default function HistorialDeUso({ historial }: { historial: ItemHistorial[] }) {
  const recientes = historial.slice(0, MAX_VISIBLE);

  return historial.length === 0 ? (
    <div className="text-center p-8 bg-[#8D62A5] rounded-2xl border border-[#C392DD]">
      <p className="text-[#FBDAF9] text-lg">Aún no has usado ninguna promoción.</p>
      <p className="text-[#FBDAF9] mt-2">¡Empieza a ahorrar aplicando las ofertas disponibles!</p>
    </div>
  ) : (
    <>
      <div className="flex flex-col gap-6">
        {recientes.map((item) => (
          <div key={item.id} className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] flex items-center justify-between gap-4">
            <div className="flex items-center gap-8 flex-1 min-w-0">
              <p className="text-white font-bold text-xl truncate">{item.nombre}</p>
              <p className="text-[#8D62A5] text-sm shrink-0">{item.fechaUso}</p>
            </div>
            <div className="flex items-center gap-8 shrink-0">
              <div className="text-right">
                <p className="text-[#8D62A5] text-xs mb-1">Original</p>
                <p className="text-[#FBDAF9] text-lg line-through">${item.valorOriginal}</p>
              </div>
              <div className="text-right">
                <p className="text-[#8D62A5] text-xs mb-1">Pagaste</p>
                <p className="text-white text-2xl font-extrabold">${item.valorPagado}</p>
              </div>
              <div className="text-right">
                <p className="text-[#8D62A5] text-xs mb-1">Ahorraste</p>
                <p className="text-[#F500F1] text-2xl font-extrabold">${item.valorOriginal - item.valorPagado}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <a
          href="/historial"
          className="px-6 py-2 bg-transparent border border-[#C392DD] text-[#C392DD] rounded-lg hover:bg-[#C392DD] hover:text-white transition-colors inline-block"
        >
          Ver historial completo →
        </a>
      </div>
    </>
  );
}