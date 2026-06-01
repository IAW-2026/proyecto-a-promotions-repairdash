import Link from 'next/link';
import { DeleteButton } from './DeleteButton';

type PromoAdmin = {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipoDescuento: string;
  valor: number;
  destacada: boolean;
  fechaInicio: Date;
  fechaFin: Date | null;
  _count: {
    historial: number;
  };
};

function estadoPromocion(fechaInicio: Date, fechaFin: Date | null, ahora: Date) {
  if (fechaInicio > ahora) return 'programada';
  if (fechaFin !== null && fechaFin < ahora) return 'caducada';
  return 'vigente';
}

export default function PromoCardDesktop({ promo, ahora }: { promo: PromoAdmin; ahora: Date }) {
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
}
