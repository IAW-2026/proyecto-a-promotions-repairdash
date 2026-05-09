"use client";
import { useRef, useState } from "react";

type Promocion = {
  id: number;
  nombre: string;
  tipoDescuento: string;
  valor: number;
  descripcion: string;
};

function CartaPromocion({ promo }: { promo: Promocion }) {
  const [copiado, setCopiado] = useState(false);
  const codigo = promo.nombre.toUpperCase().replace(/\s/g, "");

  const copiar = () => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-w-[280px] flex-shrink-0 snap-start p-6 bg-[#8D62A5] rounded-2xl shadow-lg border border-[#C392DD] hover:border-[#F500F1] transition-colors">
      <h4 className="text-xl font-bold text-white mb-2">{promo.nombre}</h4>
      <p className="text-[#FBDAF9] mb-1">
        <span className="font-semibold text-[#F500F1]">
          {promo.tipoDescuento}{promo.valor} off
        </span>
      </p>
      <p className="text-[#FBDAF9] mb-4">{promo.descripcion}</p>

      {/* Código con botón copiar */}
      <div className="flex items-center gap-2 bg-[#271033] rounded-lg px-3 py-2 mb-4">
        <span className="font-mono text-sm text-[#F500F1] flex-1 tracking-widest">
          {codigo}
        </span>
        <button
          onClick={copiar}
          className="text-[#C392DD] hover:text-white transition-colors"
          aria-label="Copiar código"
        >
          {copiado ? (
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      <button className="w-full px-4 py-2 bg-[#C392DD] text-white rounded-lg font-medium hover:bg-[#F500F1] transition-colors">
        Aplicar Promoción
      </button>
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
      <div className="hidden md:flex flex-1 flex-col justify-center bg-[#1b0422] rounded-2xl p-8">
        <h4 className="text-3xl font-bold text-[#F500F1] mb-4">
          ¡Explora las promociones para vos!
        </h4>
        <p className="text-[#FBDAF9] text-lg leading-8">
          Copiá el código de descuento y utilizalo en tu próximo servicio.
        </p>
      </div>

      <div className="flex-1 min-w-0 relative">
        {/* Flechas — solo desktop */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-[#8D62A5] hover:bg-[#F500F1] rounded-full p-2 transition-colors shadow-lg"
          aria-label="Anterior"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-[#8D62A5] hover:bg-[#F500F1] rounded-full p-2 transition-colors shadow-lg"
          aria-label="Siguiente"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}