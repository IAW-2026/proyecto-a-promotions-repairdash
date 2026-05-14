import Header from '../../components/Header';
import { prisma } from '@/lib/prisma';

type ItemHistorial = {
  id: number;
  nombre: string;
  fechaUso: Date;
  valorPagado: number;
  valorOriginal: number;
  trabajoId: number;
  usuarioId: string;
};

export default async function HistorialAdmin() {
  const historial: ItemHistorial[] = await prisma.historialDeUso.findMany({
    orderBy: { fechaUso: 'desc' },
  });

  const historialFormateado = historial.map((item) => ({
    ...item,
    fechaUso: item.fechaUso.toLocaleDateString('es-AR'),
  }));

  // --- Lógica de Métricas ---
  
  // 1. Cantidad de usuarios únicos (usando un Set para eliminar duplicados)
  const usuariosUnicos = new Set(historial.map(item => item.usuarioId)).size;

  // 2. Promoción más usada
  const conteoPromos: Record<string, number> = {};
  historial.forEach(item => {
    conteoPromos[item.nombre] = (conteoPromos[item.nombre] || 0) + 1;
  });

  const promoMasUsada = Object.entries(conteoPromos).reduce((a, b) => 
    (a[1] > b[1] ? a : b), 
    ["Ninguna", 0]
  );

  const totalAhorro = historial.reduce(
    (acc, item) => acc + (item.valorOriginal - item.valorPagado),
    0
  );

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <h2 className="text-3xl font-bold text-[#C392DD] mb-2 text-center">
            Panel de Control: Historial Global
          </h2>
          <p className="text-[#FBDAF9] text-center mb-8">
            Análisis de rendimiento y uso de promociones.
          </p>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center">
              <p className="text-[#FBDAF9] text-xs uppercase tracking-wider mb-1">Usuarios Activos</p>
              <p className="text-2xl font-bold text-[#F500F1]">{usuariosUnicos}</p>
            </div>
            
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center">
              <p className="text-[#FBDAF9] text-xs uppercase tracking-wider mb-1">Promoción Popular</p>
              <p className="text-xl font-bold text-[#F500F1] truncate" title={promoMasUsada[0]}>
                {promoMasUsada[0]}
              </p>
              <p className="text-[10px] text-[#C392DD]">{promoMasUsada[1]} usos</p>
            </div>

            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center">
              <p className="text-[#FBDAF9] text-xs uppercase tracking-wider mb-1">Total Promociones</p>
              <p className="text-2xl font-bold text-[#F500F1]">{historial.length}</p>
            </div>

            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center">
              <p className="text-[#FBDAF9] text-xs uppercase tracking-wider mb-1">Ahorro Global</p>
              <p className="text-2xl font-bold text-[#F500F1]">${totalAhorro}</p>
            </div>
          </div>

          {/* Lista de registros (Tabla Desktop / Cards Mobile) */}
          {historialFormateado.length === 0 ? (
            <div className="text-center p-8 bg-[#1b0422] rounded-2xl border border-[#C392DD]">
              <p className="text-[#FBDAF9]">Sin datos disponibles.</p>
            </div>
          ) : (
            <>
              {/* Tabla Desktop */}
              <div className="hidden md:flex flex-col gap-3 overflow-x-auto">
                <div className="grid grid-cols-[1.2fr_1.8fr_0.8fr_1fr_1fr_1fr_1fr] px-6 py-3 min-w-[900px]">
                  {["ID Usuario", "Promoción", "Trabajo", "Fecha", "Original", "Pagó", "Ahorró"].map((col) => (
                    <span key={col} className="text-[#C392DD] text-sm font-semibold">{col}</span>
                  ))}
                </div>
                {historialFormateado.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1.2fr_1.8fr_0.8fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center bg-[#8D62A5] rounded-2xl border border-[#C392DD]">
                    <span className="text-[#FBDAF9] text-xs font-mono truncate mr-4">{item.usuarioId}</span>
                    <span className="text-white font-extrabold">{item.nombre}</span>
                    <span className="text-[#C392DD] font-semibold">#{item.trabajoId}</span>
                    <span className="text-[#FBDAF9] text-sm">{item.fechaUso}</span>
                    <span className="text-[#FBDAF9] line-through">${item.valorOriginal}</span>
                    <span className="text-white font-bold">${item.valorPagado}</span>
                    <span className="text-[#F500F1] font-bold">${item.valorOriginal - item.valorPagado}</span>
                  </div>
                ))}
              </div>

              {/* Cards Mobile */}
              <div className="flex flex-col gap-4 md:hidden">
                {historialFormateado.map((item) => (
                  <div key={item.id} className="p-5 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-white font-extrabold text-xl">{item.nombre}</h3>
                        <span className="text-[10px] text-[#C392DD] font-mono break-all bg-[#1b0422] px-2 py-1 rounded">
                          ID: {item.usuarioId}
                        </span>
                      </div>
                      <span className="text-xs text-[#FBDAF9] bg-[#271033] px-3 py-1 rounded-full">{item.fechaUso}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[#C392DD]">
                      <div>
                        <p className="text-[#FBDAF9] text-[10px]">Original</p>
                        <p className="text-[#FBDAF9] line-through text-xs">${item.valorOriginal}</p>
                      </div>
                      <div>
                        <p className="text-[#FBDAF9] text-[10px]">Pagó</p>
                        <p className="text-white font-bold">${item.valorPagado}</p>
                      </div>
                      <div>
                        <p className="text-[#FBDAF9] text-[10px]">Ahorró</p>
                        <p className="text-[#F500F1] font-bold">${item.valorOriginal - item.valorPagado}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}