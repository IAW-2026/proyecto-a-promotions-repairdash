// app/admin/promociones/[id]/detalle/page.tsx
import Header from '../../../../componentes/Header';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import BotonVolver from '@/app/componentes/BotonVolver';
import { esFiltroUsuarios, formatearMonto, formatearDescuento, CampoDetalle, SeccionCategorias, type FiltroUsuarios } from '@/app/componentes/DetallePromocion';

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

function formatearFechaFiltro(fecha?: string) {
  if (!fecha) return null;
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR');
}

function obtenerDetalleUsuarios(filtro: unknown): { titulo: string; detalle?: string[] } {
  if (!esFiltroUsuarios(filtro)) {
    return { titulo: 'Todos los usuarios' };
  }

  if (filtro.idsEspecificos && filtro.idsEspecificos.length > 0) {
    return { titulo: 'Usuarios específicos' };
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
  ].filter((c): c is string => Boolean(c));

  return {
    titulo: 'Usuarios filtrados',
    detalle: criterios.length > 0 ? criterios : ['No hay criterios configurados.'],
  };
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
    where: { id: promocionId, eliminada: false },
  });
  if (!promo) notFound();

  const tiposServicio = await obtenerTiposServicio();
  const nombresPorCategoria = new Map(tiposServicio.map((tipo) => [tipo.id, tipo.nombre]));
  const detalleUsuarios = obtenerDetalleUsuarios(promo.filtroUsuarios);

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
          <div className="flex items-center justify-between gap-4 mb-4">
            <BotonVolver href="/admin/promociones" />
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

            <SeccionCategorias
              categorias={promo.categorias}
              nombresPorCategoria={nombresPorCategoria}
              fallbackNombre={`ID desconocido`}
            />

            <div className="flex flex-col gap-2 pt-4 border-t border-[#8D62A5]">
              <p className="text-[#C392DD] text-xs font-bold uppercase tracking-wider">
                Usuarios a los que aplica
              </p>
              <p className="text-white text-sm font-semibold">{detalleUsuarios.titulo}</p>
              {detalleUsuarios.detalle && (
                <ul className="flex flex-col gap-1 mt-1">
                  {detalleUsuarios.detalle.map((criterio) => (
                    <li key={criterio} className="text-[#FBDAF9] text-sm">
                      {criterio}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}