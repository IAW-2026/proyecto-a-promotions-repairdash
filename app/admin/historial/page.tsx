import Header from '../../componentes/Header';
import { prisma } from '@/lib/prisma';
import Paginacion from '../../componentes/Paginacion';
import BotonVolver from '@/app/componentes/BotonVolver';
import HistorialTabla from '@/app/componentes/HistorialTabla';

const POR_PAGINA = 6;

export default async function HistorialAdmin({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const paginaActual = Math.max(1, parseInt(page ?? '1'));

  const todoElHistorial = await prisma.historialDeUso.findMany({
    select: {
      nombre: true,
      usuarioId: true,
      valorOriginal: true,
      valorPagado: true,
    },
  });

  const total = todoElHistorial.length;
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  const historialPaginado = await prisma.historialDeUso.findMany({
    orderBy: { fechaUso: 'desc' },
    skip: (paginaActual - 1) * POR_PAGINA,
    take: POR_PAGINA,
  });

  const historialFormateado = historialPaginado.map((item) => ({
    ...item,
    fechaUso: item.fechaUso.toLocaleDateString('es-AR'),
  }));

  const usuariosUnicos = new Set(todoElHistorial.map((item) => item.usuarioId)).size;

  const conteoPromos: Record<string, number> = {};
  todoElHistorial.forEach((item) => {
    conteoPromos[item.nombre] = (conteoPromos[item.nombre] || 0) + 1;
  });

  const promoMasUsada = Object.entries(conteoPromos).reduce(
    (a, b) => (a[1] > b[1] ? a : b),
    ['Ninguna', 0]
  );

  const totalAhorro = todoElHistorial.reduce(
    (acc, item) => acc + (item.valorOriginal - item.valorPagado),
    0
  );

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section>
          <BotonVolver href="/admin" />
          <h2 className="text-3xl font-bold text-[#C392DD] mb-2 text-center">
            Panel de Control: Historial Global
          </h2>
          <p className="text-[#FBDAF9] text-center mb-8">
            Análisis de rendimiento y uso de promociones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-stretch">
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Usuarios Activos</p>
              <p className="text-4xl font-extrabold text-[#F500F1]">{usuariosUnicos}</p>
            </div>
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Promoción Popular</p>
              <p className="text-2xl font-extrabold text-[#F500F1] break-words">{promoMasUsada[0]}</p>
              <p className="text-sm text-[#C392DD] mt-1">{promoMasUsada[1]} usos</p>
            </div>
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Total Usos</p>
              <p className="text-4xl font-extrabold text-[#F500F1]">{total}</p>
            </div>
            <div className="p-6 bg-[#1b0422] rounded-2xl border border-[#C392DD] text-center flex flex-col justify-center">
              <p className="text-[#FBDAF9] text-sm font-medium uppercase tracking-wider mb-2">Ahorro Global</p>
              <p className="text-4xl font-extrabold text-[#F500F1]">${totalAhorro.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {historialFormateado.length === 0 ? (
            <div className="text-center p-8 bg-[#1b0422] rounded-2xl border border-[#C392DD]">
              <p className="text-[#FBDAF9]">Sin datos disponibles.</p>
            </div>
          ) : (
            <HistorialTabla
              historial={historialFormateado}
              mostrarUsuario
              paginacion={
                <Paginacion
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  basePath="/admin/historial"
                />
              }
            />
          )}
        </section>
        <footer className="mt-12 text-center text-[#FBDAF9] text-sm">
          <p>RepairDash - Promociones</p>
        </footer>
      </main>
    </>
  );
}