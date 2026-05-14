import Header from '../components/Header';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  // Obtenemos datos rápidos para mostrar en el inicio
  const [totalPromos, totalUsos] = await Promise.all([
    prisma.promocion.count(),
    prisma.historialDeUso.count(),
  ]);

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

          {/* Accesos Directos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gestión de Promociones */}
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
                    Creá nuevos códigos, editá los existentes o desactivá promociones que ya no estén vigentes.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8D62A5]">{totalPromos} promociones activas</span>
                  <span className="text-[#F500F1] group-hover:translate-x-2 transition-transform">Administrar →</span>
                </div>
              </div>
            </Link>

            {/* Historial Global */}
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

          <footer className="mt-20 text-center">
             <div className="inline-block p-4 bg-[#1b0422] rounded-2xl border border-[#8D62A5]/30">
                <p className="text-[#8D62A5] text-xs">
                  RepairDash - Promociones
                </p>
             </div>
          </footer>
        </section>
      </main>
    </>
  );
}