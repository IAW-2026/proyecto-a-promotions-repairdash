import Header from '../componentes/Header';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import Paginacion from '../componentes/Paginacion';
import RiderAppLink from '../componentes/RiderAppLink';
import BotonVolver from '../componentes/BotonVolver';
import HistorialTabla from '../componentes/HistorialTabla';

const POR_PAGINA = 6;

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

  const historial = await prisma.historialDeUso.findMany({
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
      <main className="min-h-[calc(100vh-76px)] flex flex-col justify-between p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <BotonVolver href="/" />
          <h2 className="text-3xl font-bold text-[#F500F1] mb-2 text-center">
            Historial de Promociones Usadas
          </h2>
          <p className="text-[#FBDAF9] text-center mb-8">
            Todas las promociones que aplicaste hasta ahora.
          </p>

          {total > 0 && (
            <div className="mb-8 p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] flex flex-col md:flex-row justify-around items-center gap-4 text-center">
              <div>
                <p className="text-[#FBDAF9] text-sm mb-1">Promociones usadas</p>
                <p className="text-3xl font-bold text-[#F500F1]">{total.toLocaleString('es-AR')}</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-[#8D62A5]" />
              <div>
                <p className="text-[#FBDAF9] text-sm mb-1">Total ahorrado</p>
                <p className="text-3xl font-bold text-[#F500F1]">${ahorro.toLocaleString('es-AR')}</p>
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
            <HistorialTabla
              historial={historialFormateado}
              paginacion={
                <Paginacion
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  basePath="/historial"
                />
              }
            />
          )}
        </section>
        <footer className="mt-12 text-center text-[#FBDAF9] text-sm">
          <div className="w-full flex justify-center mb-4">
            <RiderAppLink />
          </div>
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}