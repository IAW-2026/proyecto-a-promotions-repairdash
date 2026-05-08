import HistorialDeUso from './components/HistorialDeUso';
import CarruselPromociones from './components/Promociones';

//Hardcodeo de datos para demostración
const promocionesActivas = [
  { id: 1, nombre: "Plomería/2", tipoDescuento: "%", valor: "50", descripcion: "Aplica a X servicios" },
  { id: 2, nombre: "Sumate a la app", tipoDescuento: "$", valor: "300", descripcion: "Para todos los usuarios nuevos" },
  { id: 3, nombre: "Mayo con vos", tipoDescuento: "%", valor: "15", descripcion: "Disfruta del mes de Mayo" },
];
const historialPromociones = [
  { id: 1, nombre: "Promoción 1", fechaUso: "2024-06-01" },
  { id: 2, nombre: "Promoción 2", fechaUso: "2024-06-02" },
  { id: 3, nombre: "Promoción 3", fechaUso: "2024-06-03" },
  { id: 4, nombre: "Promoción 4", fechaUso: "2024-06-04" },
  { id: 5, nombre: "Promoción 5", fechaUso: "2024-06-05" }
];

export default function PaginaInicio() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 pt-0 bg-[#271033] text-white w-full">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-6 bg-[#1f0627] border-b border-[#8D62A5] mb-10">
        <div className="max-w-6xl mx-auto text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            RepairDash
          </h1>
        </div>
      </header>

      {/* Bienvenida */}
      <section className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#C392DD] mb-4">
          ¡Hola, Usuario!
        </h2>
        <p className="text-[#FBDAF9]">
          Bienvenido a tu panel de promociones, explora las ofertas disponibles.
        </p>
      </section>

      {/* Promociones Activas */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
          Promociones Activas
        </h3>
        <CarruselPromociones promociones={promocionesActivas} />
      </section>

      {/* Historial de Promociones */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
          Historial de Promociones Usadas
        </h3>
        <HistorialDeUso historial={historialPromociones} />
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-[#FBDAF9] text-sm">
        <p>RepairDash - Promociones</p>
      </footer>
    </main>
  );
}
