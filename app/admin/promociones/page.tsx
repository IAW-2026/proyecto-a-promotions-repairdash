import Link from 'next/link';
import Header from '../../componentes/Header';
import { prisma } from '@/lib/prisma';
import { DeleteButton } from './componentes/DeleteButton';
import Paginacion from '../../componentes/Paginacion';
import BuscarPromociones from '../../componentes/BuscarPromociones';
import { obtenerTiposServicio } from '@/lib/tiposServicio';
import BotonVolver from '@/app/componentes/BotonVolver';

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

function estadoPromocion(fechaInicio: Date, fechaFin: Date | null, ahora: Date) {
  if (fechaInicio > ahora) return 'programada';
  if (fechaFin !== null && fechaFin < ahora) return 'caducada';
  return 'vigente';
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
          <div className="flex items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-bold text-[#C392DD]">Gestión de Promociones</h2>
            <Link
              href="/admin/promociones/nueva"
              className="px-5 py-2 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors whitespace-nowrap"
            >
              + Nueva promoción
            </Link>
          </div>

          <BuscarPromociones
            basePath="/admin/promociones"
            queryNombre={queryNombre}
            serviciosSeleccionados={serviciosSeleccionados}
            tiposServicio={tiposServicio}
            esAdmin={true} // <-- IMPORTANTE
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

            {promociones.map((promo) => {
              const inicio = new Date(promo.fechaInicio);
              const fin = promo.fechaFin ? new Date(promo.fechaFin) : null;
              const estado = estadoPromocion(inicio, fin, ahora);
              const esFutura = estado === 'programada';
              const esCaducada = estado === 'caducada';

              let colorFondoFila = 'bg-[#8D62A5]';
              if (esFutura) colorFondoFila = 'bg-[#6b4582]';
              if (esCaducada) colorFondoFila = 'bg-[#431b54]';

              return (
                <div
                  key={promo.id}
                  className={`flex flex-col p-4 rounded-2xl border border-[#C392DD] hover:border-[#F500F1] transition-all gap-3 ${colorFondoFila}`}
                >
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-2 items-center w-full">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center col-span-4 gap-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-extrabold text-lg">{promo.nombre}</p>

                          {esFutura && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#C392DD] text-white">
                              Programada
                            </span>
                          )}
                          {esCaducada && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#271033] text-white">
                              Caducada
                            </span>
                          )}
                        </div>
                        <p className="text-[#FBDAF9] text-[13px] mt-1">{promo.descripcion}</p>

                        {esFutura && (
                          <p className="text-[#FBDAF9] text-sm font-semibold mt-1">
                            Válida desde: {inicio.toLocaleDateString()} a las {inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {esCaducada && fin && (
                          <p className="text-[#C392DD] text-sm font-semibold mt-1">
                            Venció el: {fin.toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <span className="inline-flex items-center bg-[#271033] text-[#F500F1] font-bold px-3 py-1 rounded-md w-fit">
                        {promo.tipoDescuento}
                        {promo.tipoDescuento === '$'
                          ? new Intl.NumberFormat('es-AR').format(promo.valor)
                          : promo.valor}
                        {' '}off
                      </span>

                      <span className="text-[#FBDAF9]">
                        {promo._count.historial} uso{promo._count.historial !== 1 ? 's' : ''}
                      </span>

                      <span className={promo.destacada ? 'text-[#FBDAF9] font-semibold' : 'text-[#FBDAF9]'}>
                        {promo.destacada ? 'Sí' : 'No'}
                      </span>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/promociones/${promo.id}/detalle`}
                        className="px-3 py-1 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors flex items-center font-normal"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/promociones/${promo.id}/edicion`}
                        className="px-3 py-1 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors flex items-center font-normal"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={promo.id} usos={promo._count.historial} />
                    </div>
                  </div>
                  {esCaducada && (
                    <div className="mx-auto w-fit p-3 bg-[#1b0422] border border-red-500 rounded-xl flex items-center justify-center gap-2 text-xs text-[#FBDAF9] text-center">
                      <span className="text-red-500 font-bold">Sugerencia:</span>
                      Actualizá la fecha de vigencia o eliminá la promoción para mantener el panel organizado.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 md:hidden">
            {promociones.length === 0 && (
              <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center text-[#FBDAF9]">
                No hay promociones que coincidan con esos filtros.
              </div>
            )}

            {promociones.map((promo) => {
              const inicio = new Date(promo.fechaInicio);
              const fin = promo.fechaFin ? new Date(promo.fechaFin) : null;
              const estado = estadoPromocion(inicio, fin, ahora);
              const esFuturaCard = estado === 'programada';
              const esCaducadaCard = estado === 'caducada';

              let colorFondoMobile = 'bg-[#8D62A5]';
              if (esFuturaCard) colorFondoMobile = 'bg-[#6b4582]';
              if (esCaducadaCard) colorFondoMobile = 'bg-[#431b54]';

              return (
                <div
                  key={promo.id}
                  className={`p-5 rounded-2xl border border-[#C392DD] flex flex-col gap-3 ${colorFondoMobile}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-extrabold text-lg">{promo.nombre}</h3>
                          {esFuturaCard && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-[#C392DD] text-white">
                              Programada
                            </span>
                          )}
                          {esCaducadaCard && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-[#271033] text-white">
                              Caducada
                            </span>
                          )}
                        </div>
                        <p className="text-[#FBDAF9] text-sm mt-1">{promo.descripcion}</p>
                      </div>
                      <span className="inline-flex items-center bg-[#271033] text-[#F500F1] font-bold px-3 py-1 rounded-md w-fit whitespace-nowrap">
                        {promo.tipoDescuento}
                        {promo.tipoDescuento === '$'
                          ? new Intl.NumberFormat('es-AR').format(promo.valor)
                          : promo.valor}
                        {' '}off
                      </span>
                    </div>

                    {esFuturaCard && (
                      <p className="text-[#FBDAF9] text-xs font-semibold mt-2">
                        Activa desde: {inicio.toLocaleDateString()}
                      </p>
                    )}
                    {esCaducadaCard && fin && (
                      <p className="text-[#C392DD] text-sm font-semibold mt-2">
                        Venció el: {fin.toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-4 text-sm mt-2">
                      <span className="text-[#FBDAF9]">{promo._count.historial} usos</span>
                      <span className="text-[#FBDAF9]">
                        {promo.destacada ? 'Destacada' : 'No destacada'}
                      </span>
                    </div>
                  </div>

                  {esCaducadaCard && (
                    <div className="mx-auto w-fit p-3 bg-[#1b0422] border border-red-500 rounded-xl text-xs text-[#FBDAF9] text-center">
                      <p className="font-bold text-red-500 mb-0.5">Sugerencia:</p>
                      Actualizá la fecha de vigencia o eliminá la promoción.
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-[#C392DD]">
                    <Link
                      href={`/admin/promociones/${promo.id}/detalle`}
                      className="flex-1 text-center px-3 py-2 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors"
                    >
                      Ver detalle
                    </Link>

                    <Link
                      href={`/admin/promociones/${promo.id}/edicion`}
                      className="flex-1 text-center px-3 py-2 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors"
                    >
                      Editar
                    </Link>
                    <DeleteButton id={promo.id} usos={promo._count.historial} />
                  </div>
                </div>
              );
            })}
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
