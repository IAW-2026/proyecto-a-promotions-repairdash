import Link from 'next/link';
import Header from '../../components/Header';
import { prisma } from '@/lib/prisma';
import { DeleteButton } from './DeleteButton';

export default async function AdminPromociones() {
  const promociones = await prisma.promocion.findMany({
    where: { eliminada: false },
    include: { _count: { select: { historial: true } } },
    orderBy: { id: 'desc' },
  });

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#C392DD]">
              Gestión de Promociones
            </h2>
            <Link
              href="/admin/promociones/nueva"
              className="px-5 py-2 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors"
            >
              + Nueva promoción
            </Link>
          </div>

          <div className="hidden md:flex flex-col gap-3">
            {/* Header tabla */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] px-6 py-3">
              {["Nombre", "Descuento", "Usos", "Destacada", "Acciones"].map((col) => (
                <span key={col} className="text-[#C392DD] text-sm font-semibold">{col}</span>
              ))}
            </div>

            {/* Filas */}
            {promociones.map((promo) => (
              <div
                key={promo.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] px-6 py-4 items-center bg-[#8D62A5] rounded-2xl border border-[#C392DD] hover:border-[#F500F1] transition-colors"
              >
                <div>
                  <p className="text-white font-extrabold">{promo.nombre}</p>
                  <p className="text-[#FBDAF9] text-xs mt-1">{promo.descripcion}</p>
                </div>
                <span className="text-[#F500F1] font-bold">
                  {promo.tipoDescuento}{promo.valor} off
                </span>
                <span className="text-[#FBDAF9]">
                  {promo._count.historial} uso{promo._count.historial !== 1 ? 's' : ''}
                </span>
                <span className={promo.destacada ? 'text-[#F500F1] font-semibold' : 'text-[#FBDAF9]'}>
                  {promo.destacada ? 'Sí' : 'No'}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/promociones/${promo.id}`}
                    className="px-3 py-1 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={promo.id} usos={promo._count.historial} />
                </div>
              </div>
            ))}
          </div>

          {/* Cards — mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {promociones.map((promo) => (
              <div
                key={promo.id}
                className="p-5 bg-[#8D62A5] rounded-2xl border border-[#C392DD] flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-extrabold text-lg">{promo.nombre}</h3>
                  <span className="text-[#F500F1] font-bold text-sm">{promo.tipoDescuento}{promo.valor} off</span>
                </div>
                <p className="text-[#FBDAF9] text-sm">{promo.descripcion}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-[#FBDAF9]">{promo._count.historial} usos</span>
                  <span className={promo.destacada ? 'text-[#F500F1]' : 'text-[#FBDAF9]'}>
                    {promo.destacada ? '★ Destacada' : 'No destacada'}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-[#C392DD]">
                  <Link
                    href={`/admin/promociones/${promo.id}`}
                    className="flex-1 text-center px-3 py-2 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={promo.id} usos={promo._count.historial} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}