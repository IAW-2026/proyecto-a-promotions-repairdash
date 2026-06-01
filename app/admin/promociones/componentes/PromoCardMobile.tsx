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

export default function PromoCardMobile({ promo, ahora }: { promo: PromoAdmin; ahora: Date }) {
  const inicio = new Date(promo.fechaInicio);
  const fin = promo.fechaFin ? new Date(promo.fechaFin) : null;
  const estado = estadoPromocion(inicio, fin, ahora);
  const esFuturaCard = estado === 'programada';
  const esCaducadaCard = estado === 'caducada';

  let colorFondoMobile = 'bg-[#8D62A5]';
  if (esFuturaCard) colorFondoMobile = 'bg-[#6b4582]';
  if (esCaducadaCard) colorFondoMobile = 'bg-[#431b54]';

  return (
    <div className={`p-5 rounded-2xl border border-[#C392DD] flex flex-col gap-3 ${colorFondoMobile}`}>
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
            <p className="text-[#FBDAF9] text-sm mt-1 text-left md:text-justify">{promo.descripcion}</p>
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
          <span className="text-[#C392DD]">{promo._count.historial} usos</span>
          <span className="text-[#C392DD]">
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
}
