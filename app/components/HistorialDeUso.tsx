

type ItemHistorial = {
  id: number;
  nombre: string;
  fechaUso: string;
};

const MAX_VISIBLE = 4;

export default function HistorialDeUso({ historial }: { historial: ItemHistorial[] }) {
  const recientes = historial.slice(0, MAX_VISIBLE);

  return historial.length === 0 ? (
  <div className="text-center p-8 bg-[#8D62A5] rounded-2xl border border-[#C392DD]">
    <p className="text-[#FBDAF9] text-lg">Aún no has usado ninguna promoción.</p>
    <p className="text-[#FBDAF9] mt-2">¡Empieza a ahorrar aplicando las ofertas disponibles!</p>
  </div>
  ) : (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recientes.map((item) => (
          <div key={item.id} className="p-4 bg-[#8D62A5] rounded-2xl border border-[#C392DD]">
            <p className="text-white font-semibold">{item.nombre}</p>
            <p className="text-[#FBDAF9] text-sm">{item.fechaUso}</p>
          </div>
        ))}
      </div>

      {historial.length > MAX_VISIBLE && (
        <button className="mt-6 mx-auto block px-6 py-2 bg-transparent border border-[#C392DD] text-[#C392DD] rounded-lg hover:bg-[#C392DD] hover:text-white transition-colors">
          Ver historial completo →
        </button>
      )}
    </>
  );
}