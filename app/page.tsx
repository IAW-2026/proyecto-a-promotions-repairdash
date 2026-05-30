import Header from './componentes/Header';
import HistorialDeUso from './componentes/HistorialDeUso';
import CarruselPromociones from './componentes/Promociones';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { usuarioCalifica } from '@/lib/filtroUsuarios';
import RiderAppLink from './componentes/RiderAppLink';

export default async function PaginaInicio() {
  const user = await currentUser();
  const nombreUsuario = user?.firstName ?? user?.emailAddresses[0].emailAddress ?? 'Usuario';
  const ahora = new Date();

  const todasLasPromos = await prisma.promocion.findMany({
    where: { 
      destacada: true, 
      eliminada: false,
      fechaInicio: { lte: ahora },
      OR: [
        { fechaFin: null },
        { fechaFin: { gte: ahora } },
      ],
    },
  });

  const promocionesActivas = (
    await Promise.all(
      todasLasPromos.map(async (promo) => {
        const califica = await usuarioCalifica(user?.id ?? '', promo.filtroUsuarios as any);
        return califica ? promo : null;
      })
    )
  ).filter(Boolean);

  const historialPromociones = (
    await prisma.historialDeUso.findMany({
      where: { usuarioId: user?.id ?? '' },
      orderBy: { fechaUso: 'desc' },
    })
  ).map((item) => ({
    ...item,
    fechaUso: item.fechaUso.toLocaleDateString('es-AR'),
  }));

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 pt-0 bg-[#271033] text-white w-full">
        <section className="text-center mb-12 mt-8">
          <h2 className="text-3xl font-bold text-[#C392DD] mb-4">
            ¡Hola, {nombreUsuario}!
          </h2>
          <p className="text-[#FBDAF9]">
            Bienvenido a tu panel de promociones.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
            ¡Explorá las ofertas exclusivas para vos!
          </h3>
          <CarruselPromociones promociones={promocionesActivas as any} />
        </section>

        <div className="mb-12">
          <RiderAppLink />
        </div>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
            Historial de Promociones Usadas
          </h3>
          <HistorialDeUso historial={historialPromociones} />
        </section>

        <footer className="mt-12 text-center text-[#FBDAF9] text-sm">
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}
