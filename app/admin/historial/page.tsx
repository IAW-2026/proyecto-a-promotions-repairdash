import Header from '../../componentes/Header';
import { prisma } from '@/lib/prisma';
import Paginacion from '../../componentes/Paginacion';
import BotonVolver from '@/app/componentes/BotonVolver';
import type { ItemHistorial } from '@/types/promociones';

function abreviarId(id: string) {
  return `...${id.slice(-6)}`;
}

const POR_PAGINA = 6;

export default async function HistorialAdmin({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const paginaActual = Math.max(1, parseInt(page ?? '1'));

  const todoElHistorial = await prisma.historialDeUso.findMany({
    select: {
      nombre: true,
      usuarioId: true,
      valorOriginal: true,
      valorPagado: true,
    },
  });

  const total = todoElHistorial.length;
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  const historialPaginado: ItemHistorial[] = await prisma.historialDeUso.findMany({
    orderBy: { fechaUso: 'desc' },
    skip: (paginaActual - 1) * POR_PAGINA,
    take: POR_PAGINA,
  });

  const historialFormateado = historialPaginado.map((item) => ({
    ...item,
    fechaUso: item.fechaUso.toLocaleDateString('es-AR'),
  }));

  const usuariosUnicos = new Set(todoElHistorial.map(item => item.usuarioId)).size;

  const conteoPromos: Record<string, number> = {};
  todoElHistorial.forEach(item => {
    conteoPromos[item.nombre] = (conteoPromos[item.nombre] || 0) + 1;
  });

  const promoMasUsada = Object.entries(conteoPromos).reduce((a, b) =>
    (a[1] > b[1] ? a : b),
    ["Ninguna", 0]
  );

  const totalAhorro = todoElHistorial.reduce(
    (acc, item) => acc + (item.valorOriginal - item.valorPagado),
    0
  );

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <BotonVolver href="/admin" />
          <h2 className="text-3xl font-bold text-[#C392DD] mb-2 text-center">
            Panel de Control: Historial Global
          </h2>
          <p className="text-[#FBDAF9] text-center mb-8">
            Análisis de rendimiento y uso de promociones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-stretch">
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Usuarios Activos</p>
              <p className="text-4xl font-extrabold text-[#F500F1]">{usuariosUnicos}</p>
            </div>
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Promoción Popular</p>
              <p className="text-2xl font-extrabold text-[#F500F1] break-words">{promoMasUsada[0]}</p>
              <p className="text-sm text-[#C392DD] mt-1">{promoMasUsada[1]} usos</p>
            </div>
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Total Usos</p>
              <p className="text-4xl font-extrabold text-[#F500F1]">{total}</p>
            </div>
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Ahorro Global</p>
              <p className="text-4xl font-extrabold text-[#F500F1]">${totalAhorro.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {historialFormateado.length === 0 ? (
            <div className="text-center p-8 bg-[#1b0422] rounded-2xl border border-[#C392DD]">
              <p className="text-[#FBDAF9]">Sin datos disponibles.</p>
            </div>
          ) : (
            <>
              {/* Tabla Desktop */}
              <div className="hidden md:flex flex-col gap-3 overflow-x-auto">
                <div className="grid grid-cols-[1.2fr_2.1fr_1fr_1fr_1fr_1fr_1fr] px-6 py-3 min-w-[900px]">
                  {["Usuario", "Promoción", "Trabajo", "Fecha", "Original", "Pagó", "Ahorró"].map((col) => (
                    <span key={col} className="text-[#C392DD] text-sm font-semibold">{col}</span>
                  ))}
                </div>
                {historialFormateado.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1.0fr_2.4fr_0.8fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center bg-[#8D62A5] rounded-2xl border border-[#C392DD] min-w-[900px]">
                    <span className="text-[#FBDAF9] text-xs font-mono" title={item.usuarioId}>
                      {abreviarId(item.usuarioId)}
                    </span>
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
                {historialFormateado.map((item) => (
                  <div key={item.id} className="p-5 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-white font-extrabold text-xl">{item.nombre}</h3>
                        <span className="text-s text-[#FBDAF9]">{item.fechaUso}</span>
                      </div>
                      <span className="text-xs text-[#C392DD] font-mono">
                        ID:{item.usuarioId}
                      </span>
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
              <Paginacion 
                paginaActual={paginaActual} 
                totalPaginas={totalPaginas} 
                basePath="/admin/historial" 
              />
            </>
          )}
        </section>
        <footer className="mt-12 text-center text-[#FBDAF9] text-sm">
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}