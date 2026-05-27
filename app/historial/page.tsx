import Header from '../componentes/Header';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import Paginacion from '../componentes/Paginacion';

const POR_PAGINA = 6;

type ItemHistorial = {
  id: number;
  nombre: string;
  fechaUso: Date;
  valorPagado: number;
  valorOriginal: number;
  trabajoId: number;
};

export default async function PaginaHistorial({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const paginaActual = Math.max(1, parseInt(page ?? '1'));
  const user = await currentUser();

  const total = await prisma.historialDeUso.count({
    where: { usuarioId: user?.id ?? '' },
  });

  const historial: ItemHistorial[] = await prisma.historialDeUso.findMany({
    where: { usuarioId: user?.id ?? '' },
    orderBy: { fechaUso: 'desc' },
    skip: (paginaActual - 1) * POR_PAGINA,
    take: POR_PAGINA,
  });

  const historialFormateado = historial.map((item) => ({
    ...item,
    fechaUso: item.fechaUso.toLocaleDateString('es-AR'),
  }));

  const totalAhorro = await prisma.historialDeUso.aggregate({
    where: { usuarioId: user?.id ?? '' },
    _sum: { valorOriginal: true, valorPagado: true },
  });

  const ahorro = (totalAhorro._sum.valorOriginal ?? 0) - (totalAhorro._sum.valorPagado ?? 0);
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <h2 className="text-3xl font-bold text-[#C392DD] mb-2 text-center">
            Historial de Promociones Usadas
          </h2>
          <p className="text-[#FBDAF9] text-center mb-8">
            Todas las promociones que aplicaste hasta ahora.
          </p>

          {total > 0 && (
            <div className="mb-8 p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] flex flex-col md:flex-row justify-around items-center gap-4 text-center">
              <div>
                <p className="text-[#FBDAF9] text-sm mb-1">Promociones usadas</p>
                <p className="text-3xl font-bold text-[#F500F1]">{total}</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-[#8D62A5]" />
              <div>
                <p className="text-[#FBDAF9] text-sm mb-1">Total ahorrado</p>
                <p className="text-3xl font-bold text-[#F500F1]">${ahorro}</p>
              </div>
            </div>
          )}

          {historialFormateado.length === 0 ? (
            <div className="text-center p-8 bg-[#8D62A5] rounded-2xl border border-[#C392DD]">
              <p className="text-[#FBDAF9] text-lg">Aún no usaste ninguna promoción.</p>
              <p className="text-[#FBDAF9] mt-2">¡Empezá a ahorrar aplicando las ofertas disponibles!</p>
              <Link href="/promociones" className="inline-block mt-4 px-6 py-2 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors">
                Ver promociones →
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden md:flex flex-col gap-3">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-6 py-3">
                  {["Promoción", "Trabajo", "Fecha", "Precio original", "Pagaste", "Ahorraste"].map((col) => (
                    <span key={col} className="text-[#C392DD] text-sm font-semibold">{col}</span>
                  ))}
                </div>
                {historialFormateado.map((item) => (
                  <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center bg-[#8D62A5] rounded-2xl border border-[#C392DD] hover:border-[#F500F1] transition-colors">
                    <span className="text-white font-extrabold">{item.nombre}</span>
                    <span className="text-[#C392DD] font-semibold">#{item.trabajoId}</span>
                    <span className="text-[#FBDAF9] text-sm">{item.fechaUso}</span>
                    <span className="text-[#FBDAF9] line-through">${item.valorOriginal}</span>
                    <span className="text-white font-bold">${item.valorPagado}</span>
                    <span className="text-[#F500F1] font-bold">${item.valorOriginal - item.valorPagado}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 md:hidden">
                {historialFormateado.map((item) => (
                  <div key={item.id} className="p-5 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-extrabold text-xl">{item.nombre}</h3>
                      <span className="text-xs text-[#FBDAF9] ml-2">{item.fechaUso}</span>
                    </div>
                    <span className="text-[#FBDAF9] text-xs">
                      Trabajo <span className="font-semibold text-[#C392DD]">#{item.trabajoId}</span>
                    </span>
                    <div className="flex justify-between pt-3 border-t border-[#C392DD]">
                      <div>
                        <p className="text-[#FBDAF9] text-xs mb-1">Precio original</p>
                        <p className="text-[#FBDAF9] line-through">${item.valorOriginal}</p>
                      </div>
                      <div>
                        <p className="text-[#FBDAF9] text-xs mb-1">Pagaste</p>
                        <p className="text-white font-bold text-lg">${item.valorPagado}</p>
                      </div>
                      <div>
                        <p className="text-[#FBDAF9] text-xs mb-1">Ahorraste</p>
                        <p className="text-[#F500F1] font-bold text-lg">${item.valorOriginal - item.valorPagado}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} basePath="/historial" />
            </>
          )}
        </section>
        <footer className="mt-16 text-center text-[#FBDAF9] text-sm">
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}