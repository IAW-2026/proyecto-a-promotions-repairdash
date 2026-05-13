import Header from './components/Header';
import HistorialDeUso from './components/HistorialDeUso';
import CarruselPromociones from './components/Promociones';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export default async function PaginaInicio() {
  const user = await currentUser();
  const nombreUsuario = user?.firstName ?? user?.emailAddresses[0].emailAddress ?? 'Usuario';

  const promocionesActivas = await prisma.promocion.findMany({
    where: { destacada: true }
  });

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

        {/* Bienvenida */}
        <section className="text-center mb-12 mt-8">
          <h2 className="text-3xl font-bold text-[#C392DD] mb-4">
            ¡Hola, {nombreUsuario}!
          </h2>
          <p className="text-[#FBDAF9]">
            Bienvenido a tu panel de promociones, explorá las ofertas disponibles.
          </p>
        </section>

        {/* Promociones Activas */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
            Promociones Activas
          </h3>
          <CarruselPromociones promociones={promocionesActivas} />
        </section>

        {/* Historial de Promociones */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
            Historial de Promociones Usadas
          </h3>
          <HistorialDeUso historial={historialPromociones} />
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-[#FBDAF9] text-sm">
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}