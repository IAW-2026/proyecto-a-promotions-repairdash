export default function PaginaInicio() {
 
  //Hardcodeo de promociones activas y historial de promociones usadas 

  const promocionesActivas = [
    { id: 1, nombre: "Plomería/2", tipoDescuento: " % ", valor: "50", descripcion: "Aplica a X servicios" },
    { id: 2, nombre: "Sumate a la app", tipoDescuento: "$", valor: "300", descripcion: "Para todos los usuarios nuevos" },
    { id: 3, nombre: "Mayo con vos", tipoDescuento: " % ", valor: "15", descripcion: "Disfruta del mes de Mayo" },
  ];

  const historialPromociones = [];

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-[#271033] text-white w-full">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#F500F1] tracking-tight">
          RepairDash-Promociones
        </h1>
        <p className="mt-2 text-lg text-[#FBDAF9]">
          Sistema de promociones y descuentos
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promocionesActivas.map((promo) => (
            <div key={promo.id} className="p-6 bg-[#8D62A5] rounded-2xl shadow-lg border border-[#C392DD] hover:border-[#F500F1] transition-colors">
              <h4 className="text-xl font-bold text-white mb-2">{promo.nombre}</h4>
              <p className="text-[#FBDAF9] mb-1"><span className="font-semibold">{promo.tipoDescuento}</span> <span className="font-semibold text-[#F500F1]">{promo.valor} off</span></p>
              <p className="text-[#FBDAF9] mb-4"> {promo.descripcion}</p>
              <button className="w-full px-4 py-2 bg-[#C392DD] text-white rounded-lg font-medium hover:bg-[#F500F1] transition-colors">
                Aplicar Promoción
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Historial de Promociones */}
      <section>
        <h3 className="text-2xl font-bold text-[#F500F1] mb-6 text-center">
          Historial de Promociones Usadas
        </h3>
        {historialPromociones.length === 0 ? (
          <div className="text-center p-8 bg-[#8D62A5] rounded-2xl border border-[#C392DD]">
            <p className="text-[#FBDAF9] text-lg">Aún no has usado ninguna promoción.</p>
            <p className="text-[#FBDAF9] mt-2">¡Empieza a ahorrar aplicando las ofertas disponibles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aquí irían las promociones usadas */}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-[#FBDAF9] text-sm">
        <p>RepairDash - Promociones</p>
      </footer>
    </main>
  );
}
