import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '../../componentes/Header';
import BotonVolver from '@/app/componentes/BotonVolver';
import BuscarPromociones from '../../componentes/BuscarPromociones';
import Paginacion from '../../componentes/Paginacion';
import { prisma } from '@/lib/prisma';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import PromoCardDesktop from './componentes/PromoCardDesktop';
import PromoCardMobile from './componentes/PromoCardMobile';

const POR_PAGINA = 6;

type FiltroUsuariosPromo = {
  idsEspecificos?: string[];
};

function obtenerParametro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] ?? '' : valor ?? '';
}

function obtenerParametros(valor: string | string[] | undefined) {
  if (!valor) return [];
  return Array.isArray(valor) ? valor.filter(Boolean) : [valor];
}

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function tieneUsuariosEspecificos(filtro: unknown): filtro is FiltroUsuariosPromo {
  return esObjeto(filtro) && Array.isArray(filtro.idsEspecificos) && filtro.idsEspecificos.length > 0;
}

function coincideFiltroUsuarios(filtro: unknown, modos: string[]) {
  if (modos.length === 0) return true;

  return modos.some((modo) => {
    if (modo === 'todos') return filtro === null;
    if (modo === 'especificos') return tieneUsuariosEspecificos(filtro);
    if (modo === 'filtrados') return esObjeto(filtro) && !tieneUsuariosEspecificos(filtro);
    return true;
  });
}

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
  const page = obtenerParametro(params.page);
  const queryNombre = obtenerParametro(params.q).trim();
  const serviciosSeleccionados = obtenerParametros(params.servicio);
  const estadosSeleccionados = obtenerParametros(params.estado);
  const usuariosSeleccionados = obtenerParametros(params.usuarios);
  const paginaActual = Math.max(1, parseInt(page || '1'));
  const ahora = new Date();
  const tiposServicio = await obtenerTiposServicio();

  const condicionesEstado = estadosSeleccionados.map((estado) => {
    if (estado === 'vigentes') {
      return { fechaInicio: { lte: ahora }, OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }] };
    }

    if (estado === 'programadas') return { fechaInicio: { gt: ahora } };
    return { fechaFin: { lt: ahora } };
  });

  const promocionesBase = await prisma.promocion.findMany({
    where: {
      eliminada: false,
      ...(queryNombre
        ? { nombre: { contains: queryNombre, mode: 'insensitive' as const } }
        : {}),
      ...(serviciosSeleccionados.length > 0
        ? { categorias: { hasSome: serviciosSeleccionados } }
        : {}),
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
    serviciosSeleccionados.forEach((servicio) => queryParams.append('servicio', servicio));
    estadosSeleccionados.forEach((estado) => queryParams.append('estado', estado));
    usuariosSeleccionados.forEach((usuarios) => queryParams.append('usuarios', usuarios));
    queryParams.set('page', String(totalPaginas));
    redirect(`/admin/promociones?${queryParams.toString()}`);
  }

  const promociones = promocionesFiltradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <BotonVolver href="/admin" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#C392DD]">
              Gestión de Promociones
            </h2>
            <Link
              href="/admin/promociones/nueva"
              className="w-full md:w-auto text-center px-5 py-2 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors whitespace-nowrap"
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

          <div className="hidden md:flex flex-col gap-3">
            <div className="grid grid-cols-[1.7fr_0.9fr_0.8fr_1fr_0.3fr] px-6 py-3">
              {['Nombre', 'Descuento', 'Usos', 'Destacada', 'Acciones'].map((col) => (
                <span key={col} className="text-[#C392DD] text-sm font-semibold">{col}</span>
              ))}
            </div>

            {promociones.length === 0 && (
              <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center text-[#FBDAF9]">
                No hay promociones que coincidan con esos filtros.
              </div>
            )}

            {promociones.map((promo) => (
              <PromoCardDesktop key={promo.id} promo={promo} ahora={ahora} />
            ))}
          </div>

          <div className="flex flex-col gap-4 md:hidden">
            {promociones.length === 0 && (
              <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center text-[#FBDAF9]">
                No hay promociones que coincidan con esos filtros.
              </div>
            )}

            {promociones.map((promo) => (
              <PromoCardMobile key={promo.id} promo={promo} ahora={ahora} />
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
