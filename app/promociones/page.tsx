import Header from '../componentes/Header';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { usuarioCalifica } from '@/lib/filtroUsuarios';
import Paginacion from '../componentes/Paginacion';
import RiderAppLink from '../componentes/RiderAppLink';

const POR_PAGINA = 9;

export default async function PaginaPromociones({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const paginaActual = Math.max(1, parseInt(page ?? '1'));
  const user = await currentUser();
  const ahora = new Date();

  const todasLasPromos = await prisma.promocion.findMany({
    where: {
      eliminada: false,
      fechaInicio: { lte: ahora },
      OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }],
    },
  });

  const promociones = (
    await Promise.all(
      todasLasPromos.map(async (promo) => {
        const califica = await usuarioCalifica(user?.id ?? '', promo.filtroUsuarios as any);
        return califica ? promo : null;
      })
    )
  ).filter(Boolean);

  const totalPaginas = Math.ceil(promociones.length / POR_PAGINA);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const paginadas = promociones.slice(inicio, inicio + POR_PAGINA);

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <h2 className="text-3xl font-bold text-[#C392DD] mb-8 text-center">
            Todas las promociones
          </h2>
          <p className="text-center text-[#FBDAF9] mb-12">
            Conocé todas las promociones vigentes que aplican para vos, las podes usar la próxima vez que solicites un servicio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginadas.map((promo) => (
              <div key={promo!.id} className="p-6 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">{promo!.nombre}</h3>
                <span className="inline-flex items-center bg-[#271033] text-[#F500F1] font-bold px-3 py-1 text-sm rounded-md w-fit whitespace-nowrap">
                  {promo!.tipoDescuento}
                  {promo!.tipoDescuento === "$"
                    ? new Intl.NumberFormat("es-AR").format(promo!.valor)
                    : promo!.valor}
                  {" "}off
                </span>
                <p className="text-[#FBDAF9] text-[13px]">{promo!.descripcion}</p>
              </div>
            ))}
          </div>
          <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} basePath="/promociones" />
        </section>
        <footer className="mt-16 text-center text-[#FBDAF9] text-sm">
            <div className="w-full flex justify-center mb-4">
              <RiderAppLink />
            </div>
            <p>RepairDash - Promociones</p>
          </footer>
      </main>
    </>
  );
}
