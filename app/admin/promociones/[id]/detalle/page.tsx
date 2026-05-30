import Header from '../../../../componentes/Header';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { obtenerTiposServicio } from '@/lib/tiposServicio';

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

function formatearFecha(fecha: Date | null) {
  if (!fecha) return 'No definida';

  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatearMonto(valor: number | null) {
  if (valor === null) return 'No definido';
  return `$${valor.toLocaleString('es-AR')}`;
}

function formatearDescuento(tipo: string, valor: number) {
  return tipo === '$'
    ? `$${valor.toLocaleString('es-AR')} off`
    : `${valor}% off`;
}

function formatearFechaFiltro(fecha?: string) {
  if (!fecha) return null;
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR');
}

async function obtenerDetalleUsuarios(filtro: unknown) {
  if (!esFiltroUsuarios(filtro)) {
    return {
      titulo: 'Todos los usuarios', 
    };
  }

  if (filtro.idsEspecificos && filtro.idsEspecificos.length > 0) {
    return {
      titulo: 'Usuarios específicos',
    };
  }

  const criterios = [
    filtro.registradosDespuesDe
      ? `Registrados después de ${formatearFechaFiltro(filtro.registradosDespuesDe)}`
      : null,
    filtro.registradosAntesDe
      ? `Registrados antes de ${formatearFechaFiltro(filtro.registradosAntesDe)}`
      : null,
    filtro.minimoUsos !== undefined
      ? `Mínimo de promociones usadas: ${filtro.minimoUsos}`
      : null,
    filtro.maximoUsos !== undefined
      ? `Máximo de promociones usadas: ${filtro.maximoUsos}`
      : null,
  ].filter((criterio): criterio is string => Boolean(criterio));

  return {
    titulo: 'Usuarios filtrados',
    detalle: criterios.length > 0 ? criterios : ['No hay criterios configurados.'],
  };
}

function CampoDetalle({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[#C392DD] text-sm font-semibold">{label}</p>
      <div className="text-[#FBDAF9] text-sm leading-relaxed">{children}</div>
    </div>
  );
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
    where: { id: promocionId, eliminada: false }
  });

  if (!promo) notFound();

  const tiposServicio = await obtenerTiposServicio();
  const nombresPorCategoria = new Map(tiposServicio.map((tipo) => [tipo.id, tipo.nombre]));
  const detalleUsuarios = await obtenerDetalleUsuarios(promo.filtroUsuarios);

  const estaIniciada = promo.fechaInicio <= ahora;
  const noHaExpirado = promo.fechaFin === null || promo.fechaFin >= ahora;
  const vigente = estaIniciada && noHaExpirado;
  const estado = vigente ? 'Vigente' : !estaIniciada ? 'Programada' : 'Expirada';
  const estadoClases = vigente
    ? 'bg-[#271033] text-[#FBDAF9] border-[#C392DD]'
    : !estaIniciada
      ? 'bg-[#271033] text-[#C392DD] border-[#8D62A5]'
      : 'bg-[#271033] text-[#8D62A5] border-[#8D62A5]';

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link href="/admin/promociones" className="text-[#C392DD] hover:text-white transition-colors">
              ← Volver
            </Link>

            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${estadoClases}`}>
              {estado}
            </span>
          </div>

          <div className="flex flex-col gap-6 bg-[#1b0422] p-8 rounded-2xl border border-[#C392DD]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-extrabold text-white">{promo.nombre || 'Nombre no definido'}</h2>
                <p className="text-[#F500F1] text-2xl font-bold">
                  {formatearDescuento(promo.tipoDescuento, promo.valor)}
                </p>
              </div>

              <Link
                href={`/admin/promociones/${promo.id}/edicion`}
                className="px-3 py-1 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors flex items-center font-normal"
              >
                Editar
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#8D62A5]">
              <CampoDetalle label="ID">{promo.id}</CampoDetalle>
              <CampoDetalle label="Precio mínimo del servicio">{formatearMonto(promo.precioMinimo)}</CampoDetalle>
              <CampoDetalle label="Destacar en página inicial">{promo.destacada ? 'Sí' : 'No'}</CampoDetalle>
              <CampoDetalle label="Uso único por usuario">{promo.usoUnico ? 'Sí' : 'No'}</CampoDetalle>
            </div>

            <div className="pt-4 border-t border-[#8D62A5]">
              <CampoDetalle label="Descripción">
                {promo.descripcion || 'No definida'}
              </CampoDetalle>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#8D62A5]">
              <CampoDetalle label="Fecha de vigencia desde">{formatearFecha(promo.fechaInicio)}</CampoDetalle>
              <CampoDetalle label="Fecha de caducidad">{formatearFecha(promo.fechaFin)}</CampoDetalle>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-[#8D62A5]">
              <p className="text-[#C392DD] text-sm font-semibold">Tipos de servicio a los que aplica</p>
              {promo.categorias.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {promo.categorias.map((categoriaId) => (
                    <span
                      key={categoriaId}
                      className="px-3 py-1 bg-[#271033] text-[#C392DD] rounded-full text-xs border border-[#8D62A5]/40"
                    >
                      {nombresPorCategoria.get(categoriaId) ?? `ID: ${categoriaId} (no vigente)`}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#FBDAF9] text-sm">No definidos</p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-[#8D62A5]">
              <p className="text-[#C392DD] text-sm font-semibold">Usuarios a los que aplica</p>
              <p className="text-white text-sm font-semibold">{detalleUsuarios.titulo}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
