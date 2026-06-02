import Header from '../componentes/Header';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { usuarioCalifica } from '@/lib/filtroUsuarios';
import Paginacion from '../componentes/Paginacion';
import RiderAppLink from '../componentes/RiderAppLink';
import Link from 'next/link';
import BuscarPromociones from '../componentes/BuscarPromociones';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import BotonVolver from '../componentes/BotonVolver';

const POR_PAGINA = 6;

function obtenerParametro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] ?? '' : valor ?? '';
}

function obtenerParametros(valor: string | string[] | undefined) {
  if (!valor) return [];
  return Array.isArray(valor) ? valor.filter(Boolean) : [valor];
}

export default async function PaginaPromociones({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; servicio?: string | string[] }>;
}) {
  const params = await searchParams;
  const page = obtenerParametro(params.page);
  const queryNombre = obtenerParametro(params.q).trim();
  const serviciosSeleccionados = obtenerParametros(params.servicio);
  const paginaActual = Math.max(1, parseInt(page || '1'));
  const user = await currentUser();
  const ahora = new Date();
  const tiposServicio = await obtenerTiposServicio();

  const todasLasPromos = await prisma.promocion.findMany({
    where: {
      eliminada: false,
      fechaInicio: { lte: ahora },
      OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }],
      ...(queryNombre
        ? { nombre: { contains: queryNombre, mode: 'insensitive' as const } }
        : {}),
      ...(serviciosSeleccionados.length > 0
        ? { categorias: { hasSome: serviciosSeleccionados } }
        : {}),
    },
  });

  const promocionesFiltradas = (
    await Promise.all(
      todasLasPromos.map(async (promo) => {
        const califica = await usuarioCalifica(
          user?.id ?? '',
          promo.filtroUsuarios as Parameters<typeof usuarioCalifica>[1]
        );
        return califica ? promo : null;
      })
    )
  ).filter((promo): promo is typeof todasLasPromos[number] => promo !== null);

  const totalPaginas = Math.ceil(promocionesFiltradas.length / POR_PAGINA);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const paginadas = promocionesFiltradas.slice(inicio, inicio + POR_PAGINA);

  return (
    <>
      <Header />
      <main className="min-h-screen p-4 md:p-8 bg-[#271033] text-white">
        <section className="max-w-7xl mx-auto">
          <BotonVolver href="/" />
          <h2 className="text-3xl font-bold text-[#F500F1] mb-4 text-center">
            Todas las promociones
          </h2>
          <p className="text-center text-[#FBDAF9] mb-12">
            Conocé todas las promociones vigentes que aplican para vos, las podes usar la próxima vez que solicites un servicio.
          </p>
          
          <BuscarPromociones
            basePath="/promociones"
            queryNombre={queryNombre}
            serviciosSeleccionados={serviciosSeleccionados}
            tiposServicio={tiposServicio}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginadas.length === 0 && (
              <p className="md:col-span-2 lg:col-span-3 text-center text-[#FBDAF9]">
                No encontramos promociones con esos filtros.
              </p>
            )}

            {paginadas.map((promo) => (
              <div 
                key={promo.id} 
                className="p-6 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto] md:items-start"
              >
                <div className="flex flex-col gap-3 md:order-1">
                  <h3 className="text-xl font-bold text-[#2f143d]">{promo.nombre}</h3>
                  <span className="inline-flex items-center bg-[#271033] text-[#F500F1] font-bold px-3 py-1 text-sm rounded-md w-fit whitespace-nowrap">
                    {promo.tipoDescuento}
                    {promo.tipoDescuento === "$"
                      ? new Intl.NumberFormat("es-AR").format(promo.valor)
                      : promo.valor}
                    {" "}off
                  </span>
                  <p className="text-[#FBDAF9] text-[13px] leading-relaxed">{promo.descripcion}</p>
                </div>

                <div className="flex justify-center pt-2 border-t border-[#C392DD]/20 md:border-t-0 md:pt-0 md:justify-end md:order-2 shrink-0">
                  <Link
                    href={`/promociones/${promo.id}`}
                    className="px-3 py-1.5 bg-[#C392DD] text-white rounded-lg text-sm hover:bg-[#271033] hover:text-white transition-colors flex items-center font-normal whitespace-nowrap"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/promociones"
            searchParams={{ q: queryNombre, servicio: serviciosSeleccionados }}
          />
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
