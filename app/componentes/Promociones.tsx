"use client";
import { useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';

type Promocion = {
  id: number;
  nombre: string;
  tipoDescuento: string;
  valor: number;
  descripcion: string;
};

function CartaPromocion({ promo }: { promo: Promocion }) {
  return (
    <div className="w-[320px] flex-shrink-0 snap-start p-6 bg-[#8D62A5] rounded-2xl shadow-lg border border-[#C392DD] hover:border-[#F500F1] transition-colors">
      <h4 className="text-xl font-extrabold text-white mb-2">{promo.nombre}</h4>
      <p className="text-[#FBDAF9] mb-1">
        <span className="font-semibold text-[#F500F1] bg-[#271033] px-2 py-1 rounded">
          {promo.tipoDescuento}{promo.valor} off
        </span>
      </p>
      <p className="text-[#FBDAF9] mb-4 break-words whitespace-normal">{promo.descripcion}</p>
    </div>
  );
}

export default function CarruselPromociones({ promociones }: { promociones: Promocion[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="hidden md:flex flex-1 relative rounded-2xl overflow-hidden min-h-[260px]">
        <Image
          src="/ImagenInicioDescuento.png"
          alt="Cupón de descuento"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 relative">
        {/* Flecha izquierda */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-2/3 -translate-x-4 z-10 text-[#C392DD] hover:text-white transition-colors"
          aria-label="Anterior"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
        >
          {promociones.map((promo) => (
            <CartaPromocion key={promo.id} promo={promo} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-2/3 translate-x-4 z-10 text-[#C392DD] hover:text-white transition-colors"
          aria-label="Siguiente"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="text-right mt-4">
          <Link href="/promociones" className="px-4 py-2 bg-transparent border border-[#C392DD] text-[#C392DD] rounded-lg hover:bg-[#C392DD] hover:text-white transition-colors text-sm font-medium">
            Ver todas las promociones →
          </Link>
        </div>
      </div>
    </div>
  );
}