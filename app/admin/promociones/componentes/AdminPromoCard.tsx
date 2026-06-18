// app/admin/promociones/componentes/PromoCard.tsx

import Link from 'next/link';
import { DeleteButton } from './DeleteButton';

type Promo = {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipoDescuento: string;
  valor: number;
  destacada: boolean;
  usoUnico: boolean;
  fechaInicio: Date;
  fechaFin: Date | null;
  filtroUsuarios: unknown;
  _count: { historial: number };
};

type Estado = 'vigente' | 'programada' | 'caducada';

type Props = {
  promo: Promo;
  estado: Estado;
};

export default function PromoCard({ promo, estado }: Props) {
  const esFutura = estado === 'programada';
  const esCaducada = estado === 'caducada';
  const inicio = promo.fechaInicio;
  const fin = promo.fechaFin;

  let colorFondo = 'bg-[#8D62A5]';
  if (esFutura) colorFondo = 'bg-[#6b4582]';
  if (esCaducada) colorFondo = 'bg-[#431b54]';

  const badge = esFutura ? (
    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#C392DD] text-white">
      Programada
    </span>
  ) : esCaducada ? (
    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#271033] text-white">
      Caducada
    </span>
  ) : null;

  const descuento = (
    <span className="inline-flex items-center bg-[#271033] text-[#F500F1] font-bold px-3 py-1 rounded-md w-fit whitespace-nowrap">
      {promo.tipoDescuento}
      {promo.tipoDescuento === '$'
        ? new Intl.NumberFormat('es-AR').format(promo.valor)
        : promo.valor}{' '}
      off
    </span>
  );

  const acciones = (
    <div className="flex gap-2">
      <Link
        href={`/admin/promociones/${promo.id}/detalle`}
        className="flex-1 text-center px-3 py-2 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors"
      >
        Ver
      </Link>
      <Link
        href={`/admin/promociones/${promo.id}/edicion`}
        className="flex-1 text-center px-3 py-2 bg-[#271033] text-[#C392DD] rounded-lg text-sm hover:bg-[#C392DD] hover:text-white transition-colors"
      >
        Editar
      </Link>
      <DeleteButton id={promo.id} usos={promo._count.historial} />
    </div>
  );

  return (
    <div className={`p-5 rounded-2xl border border-[#C392DD] flex flex-col md:flex-row md:items-center gap-6 ${colorFondo}`}>
      
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-white font-extrabold text-lg truncate max-w-full">{promo.nombre}</h3>
          {badge}
        </div>
        
        {!esCaducada && promo.descripcion && (
          <p className="text-[#FBDAF9] text-sm line-clamp-2 md:line-clamp-none">{promo.descripcion}</p>
        )}

        {esCaducada && (
          <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1 flex-wrap">
            {fin && (
              <p className="text-[#C392DD] text-sm font-semibold">
                Venció el: {fin.toLocaleDateString()}
              </p>
            )}
            
            <div className="p-1.5 px-2 bg-[#271033] border border-red-500/40 rounded-lg text-xs text-[#FBDAF9] flex items-center gap-2 w-fit">
              <span className="font-bold text-[#FBDAF9] uppercase tracking-wider text-[9px] bg-red-950 px-1.5 py-0.5 rounded border border-red-500/30 whitespace-nowrap">
                Sugerencia
              </span>
              <span className="text-[11.5px]">Actualizá la vigencia o eliminá la promoción.</span>
            </div>
          </div>
        )}

        {esFutura && (
          <p className="text-[#FBDAF9] text-xs font-semibold mt-1">
            Activa desde: {inicio.toLocaleDateString()} a las{' '}
            {inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <div className="flex items-center justify-between text-sm mt-1 gap-4 w-full">
          <div className="flex gap-4">
            <span className="text-[#FBDAF9]">
              {promo._count.historial} uso{promo._count.historial !== 1 ? 's' : ''}
            </span>
            <span className="text-[#FBDAF9]">
              {promo.destacada ? '★ Destacada' : 'No destacada'}
            </span>
          </div>
          
          <div className="md:hidden">
            {descuento}
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center md:px-4 self-center">
        {descuento}
      </div>

      <div className="pt-3 border-t border-[#C392DD] md:pt-0 md:border-t-0 md:w-auto min-w-[240px]">
        {acciones}
      </div>

    </div>
  );
}