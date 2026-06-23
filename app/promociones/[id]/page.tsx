// app/promociones/[id]/page.tsx
import Header from '../../componentes/Header';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import { usuarioCalifica } from '@/lib/filtroUsuarios';
import { currentUser } from '@clerk/nextjs/server';
import RiderAppLink from '@/app/componentes/RiderAppLink';
import BotonVolver from '@/app/componentes/BotonVolver';
import { esFiltroUsuarios, formatearMonto, formatearDescuento, CampoDetalle, SeccionCategorias } from '@/app/componentes/DetallePromocion';

async function obtenerTituloUsuarios(filtro: unknown): Promise<string> {
  if (!esFiltroUsuarios(filtro)) return 'Promoción para todos los usuarios';
  if (filtro.idsEspecificos && filtro.idsEspecificos.length > 0) return 'Beneficio exclusivo para vos';
  return 'Solo para algunos usuarios';
}

export default async function DetallePromocion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promocionId = Number(id);
  const ahora = new Date();

  if (!Number.isInteger(promocionId)) notFound();

  const promo = await prisma.promocion.findFirst({
    where: {
      id: promocionId,
      eliminada: false,
      fechaInicio: { lte: ahora },
      OR: [
        { fechaFin: null },
        { fechaFin: { gte: ahora } },
      ],
    },
  });
  if (!promo) notFound();

  const user = await currentUser();
  const califica = await usuarioCalifica(user?.id ?? '', promo.filtroUsuarios as any);
  if (!califica) notFound();

  const tiposServicio = await obtenerTiposServicio();
  const nombresPorCategoria = new Map(tiposServicio.map((tipo) => [tipo.id, tipo.nombre]));
  const tituloUsuarios = await obtenerTituloUsuarios(promo.filtroUsuarios);

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section className="max-w-2xl mx-auto w-full">
          <BotonVolver href="/promociones" />

          <div className="flex flex-col gap-6 bg-[#1b0422] p-6 md:p-8 rounded-3xl border border-[#C392DD]/40 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#8D62A5]/30 pb-6 w-full">
              <div className="flex flex-col gap-2">
                <span className="w-fit px-2.5 py-0.5 bg-[#8D62A5]/30 border border-[#C392DD]/40 text-[#FBDAF9] text-[11px] font-bold uppercase tracking-wider rounded-md">
                  {tituloUsuarios}
                </span>
                <h2 className="text-2xl font-black text-white">{promo.nombre || 'Promoción Especial'}</h2>
              </div>

              <div className="bg-[#271033] px-5 py-3 rounded-2xl border border-[#F500F1] text-center shrink-0 min-w-[120px] shadow-md mx-auto sm:mx-0">
                <span className="text-[10px] text-[#C392DD] block font-bold tracking-widest mb-0.5">AHORRÁS</span>
                <span className="text-xl font-black text-[#F500F1]">
                  {formatearDescuento(promo.tipoDescuento, promo.valor)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <CampoDetalle label="Precio Mínimo">
                {formatearMonto(promo.precioMinimo)}
              </CampoDetalle>

              <CampoDetalle label="¿Cuántas veces podés usarlo?">
                {promo.usoUnico
                  ? 'Válido para un único uso por usuario'
                  : 'No hay restricción en cantidad de usos por usuario'}
              </CampoDetalle>
            </div>

            <div className="pt-4 border-t border-[#8D62A5]/20">
              <CampoDetalle label="Detalles del beneficio">
                {promo.descripcion || 'Sin descripción detallada.'}
              </CampoDetalle>
            </div>

            <SeccionCategorias
              categorias={promo.categorias}
              nombresPorCategoria={nombresPorCategoria}
            />
          </div>
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