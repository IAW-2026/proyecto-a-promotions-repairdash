import Header from '../../componentes/Header';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import { usuarioCalifica } from '@/lib/filtroUsuarios';
import { currentUser } from '@clerk/nextjs/server';
import RiderAppLink from '@/app/componentes/RiderAppLink';
import BotonVolver from '@/app/componentes/BotonVolver';

type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

function esFiltroUsuarios(value: unknown): value is FiltroUsuarios {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatearMonto(valor: number | null) {
  if (valor === null || valor === 0) return 'Sin mínimo de compra requerido';
  return `$${valor.toLocaleString('es-AR')}`;
}

function formatearDescuento(tipo: string, valor: number) {
  return tipo === '$'
    ? `$${valor.toLocaleString('es-AR')}`
    : `${valor}% OFF`;
}

async function obtenerDetalleUsuarios(filtro: unknown) {
  if (!esFiltroUsuarios(filtro)) {
    return { titulo: 'Promoción para todos los usuarios' };
  }
  if (filtro.idsEspecificos && filtro.idsEspecificos.length > 0) {
    return { titulo: 'Beneficio exclusivo para vos' };
  }
  return { titulo: 'Solo para algunos usuarios' };
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
  const detalleUsuarios = await obtenerDetalleUsuarios(promo.filtroUsuarios);

  function CampoDetalle({
    label,
    children,
  }: {
    label: string;
    children: ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-[#C392DD] text-xs font-bold uppercase tracking-wider">{label}</p>
        <div className="text-white text-sm font-medium leading-relaxed">{children}</div>
      </div>
    );
  }

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
                  {detalleUsuarios.titulo}
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
                {promo.usoUnico ? 'Válido para un único uso por usuario' : 'No hay restricción en cantidad de usos por usuario'}
              </CampoDetalle>
            </div>

            <div className="pt-4 border-t border-[#8D62A5]/20">
              <CampoDetalle label="Detalles del beneficio">
                {promo.descripcion || 'Sin descripción detallada.'}
              </CampoDetalle>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-[#8D62A5]/20">
              <p className="text-[#C392DD] text-xs font-bold uppercase tracking-wider">Aplica en los siguientes servicios</p>
              {promo.categorias.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {promo.categorias.map((categoriaId) => (
                    <span
                      key={categoriaId}
                      className="px-3 py-1 bg-[#271033] text-white rounded-xl text-xs font-semibold border border-[#8D62A5]/60"
                    >
                      {nombresPorCategoria.get(categoriaId) ?? 'Servicio General'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white text-sm font-medium">Disponible para todos los tipos de servicios</p>
              )}
            </div>

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