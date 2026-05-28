import Header from '../componentes/Header';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TarjetaMetrica from './componentes/TarjetaMetrica';

export default async function AdminDashboard() {
  const ahora = new Date();
  const hace30Dias = new Date(ahora);
  hace30Dias.setDate(ahora.getDate() - 30);
  const en7Dias = new Date(ahora);
  en7Dias.setDate(ahora.getDate() + 7);

  const [totalPromos, totalUsos, usos30Dias, porVencer, caducadas] = await Promise.all([
    prisma.promocion.count({ where: { eliminada: false } }),
    prisma.historialDeUso.count(),
    prisma.historialDeUso.count({
      where: { fechaUso: { gte: hace30Dias } }
    }),
    prisma.promocion.count({
      where: { eliminada: false, fechaFin: { gte: ahora, lte: en7Dias } }
    }),
    prisma.promocion.count({
      where: { eliminada: false, fechaFin: { lt: ahora } }
    }),
  ]);

  const iconoTag = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
  const iconoBarras = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
  const iconoCalendario = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  const iconoReloj = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const iconoBasura = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white">
        <section className="max-w-5xl mx-auto w-full">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-[#C392DD] mb-2">
              Panel de Administración
            </h2>
            <p className="text-[#FBDAF9]">
              Bienvenido al centro de gestión de RepairDash.
            </p>
          </div>

          {/* Accesos directos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Link href="/admin/promociones" className="group">
              <div className="h-full p-8 bg-[#1b0422] rounded-3xl border border-[#C392DD] hover:border-[#F500F1] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#F500F1]/20 rounded-xl flex items-center justify-center mb-4 text-[#F500F1]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Gestionar Promociones</h3>
                  <p className="text-[#FBDAF9] text-sm leading-relaxed">
                    Podes crear promociones y visualizar, editar o desactivar las ya existentes.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8D62A5]">{totalPromos} promociones</span>
                  <span className="text-[#F500F1] group-hover:translate-x-2 transition-transform">Administrar →</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/historial" className="group">
              <div className="h-full p-8 bg-[#1b0422] rounded-3xl border border-[#C392DD] hover:border-[#F500F1] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#C392DD]/20 rounded-xl flex items-center justify-center mb-4 text-[#C392DD]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Métricas e Historial</h3>
                  <p className="text-[#FBDAF9] text-sm leading-relaxed">
                    Analizá el uso del sistema, cuántos usuarios están ahorrando y qué promociones funcionan mejor.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8D62A5]">{totalUsos} usos registrados</span>
                  <span className="text-[#F500F1] group-hover:translate-x-2 transition-transform">Ver métricas →</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Métricas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TarjetaMetrica label="Promociones activas" valor={totalPromos} icono={iconoTag} />
            <TarjetaMetrica label="Usos totales" valor={totalUsos} icono={iconoBarras} />
            <TarjetaMetrica label="Usos últimos 30 días" valor={usos30Dias} icono={iconoCalendario} />
          </div>

          {/* Métricas de alerta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <TarjetaMetrica label="Por vencer en 7 días" valor={porVencer} alerta icono={iconoReloj} />
            <TarjetaMetrica label="Caducadas sin eliminar" valor={caducadas} alerta icono={iconoBasura} />
          </div>

          <footer className="mt-8 text-center">
            <div className="inline-block p-4 bg-[#1b0422] rounded-2xl border border-[#8D62A5]/30">
              <p className="text-[#8D62A5] text-xs">RepairDash - Promociones</p>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}