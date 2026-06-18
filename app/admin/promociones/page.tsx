import Link from 'next/link';
import Header from '../../componentes/Header';
import { prisma } from '@/lib/prisma';
import Paginacion from '../../componentes/Paginacion';
import BuscarPromociones from '../../componentes/BuscarPromociones';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import BotonVolver from '@/app/componentes/BotonVolver';
import { redirect } from 'next/navigation';
import PromoCard from './componentes/AdminPromoCard';
import {
  extraerValorUnico,
  extraerValoresMultiples,
  coincideFiltroUsuarios,
  estadoPromocion,
} from '@/lib/promociones';

const POR_PAGINA = 6;

export default async function AdminPromociones({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    servicio?: string | string[];
    estado?: string | string[];
    usuarios?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const page = extraerValorUnico(params.page);
  const queryNombre = extraerValorUnico(params.q).trim();
  const serviciosSeleccionados = extraerValoresMultiples(params.servicio);
  const estadosSeleccionados = extraerValoresMultiples(params.estado);
  const usuariosSeleccionados = extraerValoresMultiples(params.usuarios);
  const paginaActual = Math.max(1, parseInt(page || '1'));
  const ahora = new Date();
  const tiposServicio = await obtenerTiposServicio();

  const condicionesEstado = estadosSeleccionados.map((estado) => {
    if (estado === 'vigentes')
      return { fechaInicio: { lte: ahora }, OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }] };
    if (estado === 'programadas') return { fechaInicio: { gt: ahora } };
    return { fechaFin: { lt: ahora } };
  });

  const promocionesBase = await prisma.promocion.findMany({
    where: {
      eliminada: false,
      ...(queryNombre ? { nombre: { contains: queryNombre, mode: 'insensitive' as const } } : {}),
      ...(serviciosSeleccionados.length > 0 ? { categorias: { hasSome: serviciosSeleccionados } } : {}),
      ...(condicionesEstado.length > 0 ? { OR: condicionesEstado } : {}),
    },
    include: { _count: { select: { historial: true } } },
    orderBy: { id: 'desc' },
  });

  const promocionesFiltradas = promocionesBase.filter((promo) =>
    coincideFiltroUsuarios(promo.filtroUsuarios, usuariosSeleccionados)
  );
  const totalPaginas = Math.ceil(promocionesFiltradas.length / POR_PAGINA);

  if (paginaActual > totalPaginas && totalPaginas > 0) {
    const queryParams = new URLSearchParams();
    if (queryNombre) queryParams.set('q', queryNombre);
    serviciosSeleccionados.forEach((s) => queryParams.append('servicio', s));
    estadosSeleccionados.forEach((e) => queryParams.append('estado', e));
    usuariosSeleccionados.forEach((u) => queryParams.append('usuarios', u));
    queryParams.set('page', String(totalPaginas));
    redirect(`/admin/promociones?${queryParams.toString()}`);
  }

  const promociones = promocionesFiltradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const sinResultados = (
    <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center text-[#FBDAF9]">
      No hay promociones que coincidan con esos filtros.
    </div>
  );

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <BotonVolver href="/admin" />
          <div className="flex items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-bold text-[#C392DD]">Gestión de Promociones</h2>
            <Link
              href="/admin/promociones/nueva"
              className="px-3 md:px-5 py-2 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors text-center text-sm md:text-base"
            >
              + Nueva promoción
            </Link>
          </div>

          <BuscarPromociones
            basePath="/admin/promociones"
            queryNombre={queryNombre}
            serviciosSeleccionados={serviciosSeleccionados}
            tiposServicio={tiposServicio}
            esAdmin={true}
            filtrosExtra={[
              {
                nombre: 'estado',
                label: 'Estado',
                seleccionados: estadosSeleccionados,
                opciones: [
                  { id: 'vigentes', nombre: 'Vigentes' },
                  { id: 'programadas', nombre: 'Programadas' },
                  { id: 'caducadas', nombre: 'Caducadas' },
                ],
              },
              {
                nombre: 'usuarios',
                label: 'Usuarios',
                seleccionados: usuariosSeleccionados,
                opciones: [
                  { id: 'todos', nombre: 'Para todos' },
                  { id: 'filtrados', nombre: 'Usuarios filtrados' },
                  { id: 'especificos', nombre: 'Usuarios específicos' },
                ],
              },
            ]}
          />

          {/* Desktop */}
          <div className="hidden md:flex flex-col gap-3">
            {promociones.length === 0 ? sinResultados : promociones.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                estado={estadoPromocion(new Date(promo.fechaInicio), promo.fechaFin ? new Date(promo.fechaFin) : null, ahora)}
              />
            ))}
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {promociones.length === 0 ? sinResultados : promociones.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                estado={estadoPromocion(new Date(promo.fechaInicio), promo.fechaFin ? new Date(promo.fechaFin) : null, ahora)}
              />
            ))}
          </div>

          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/admin/promociones"
            searchParams={{
              q: queryNombre,
              servicio: serviciosSeleccionados,
              estado: estadosSeleccionados,
              usuarios: usuariosSeleccionados,
            }}
          />
        </section>
        <footer className="mt-12 text-center text-[#FBDAF9] text-sm">
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}