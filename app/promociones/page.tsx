import Header from '../components/Header';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { usuarioCalifica } from '@/lib/filtroUsuarios';

export default async function PaginaPromociones() {
  const user = await currentUser();
  const ahora = new Date();

  const todasLasPromos = await prisma.promocion.findMany({
    where: { 
      eliminada: false,
      fechaInicio: { lte: ahora },
      OR: [
        { fechaFin: null },
        { fechaFin: { gte: ahora } },
      ],
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

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <h2 className="text-3xl font-bold text-[#C392DD] mb-8 text-center">
            Todas las Promociones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promociones.map((promo) => (
              <div key={promo!.id} className="p-6 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">{promo!.nombre}</h3>
                <p className="text-[#F500F1] font-semibold text-lg">
                  {promo!.tipoDescuento}{promo!.valor} off
                </p>
                <p className="text-[#FBDAF9]">{promo!.descripcion}</p>

                {promo!.categorias.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {promo!.categorias.map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-[#271033] text-[#C392DD] rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {promo!.precioMinimo && (
                  <p className="text-[#FBDAF9] text-sm">
                    Precio mínimo: ${promo!.precioMinimo}
                  </p>
                )}

                <p className="text-[#FBDAF9] text-sm">
                  {promo!.filtroUsuarios ? 'Promoción exclusiva para algunos usuarios' : 'Disponible para todos'}
                </p>

                <div className="flex items-center gap-2 bg-[#271033] rounded-lg px-3 py-2 mt-auto">
                  <span className="font-mono text-sm text-[#F500F1] flex-1 tracking-widest">
                    {promo!.codigo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}