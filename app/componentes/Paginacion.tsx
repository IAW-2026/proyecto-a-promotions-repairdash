import Link from 'next/link';

type Props = {
  paginaActual: number;
  totalPaginas: number;
  basePath: string;
};

export default function Paginacion({ paginaActual, totalPaginas, basePath }: Props) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {paginaActual > 1 ? (
        <Link
          href={`${basePath}?page=${paginaActual - 1}`}
          className="px-4 py-2 bg-transparent border border-[#C392DD] text-[#C392DD] rounded-lg hover:bg-[#C392DD] hover:text-white transition-colors text-sm font-medium"
        >
          ← Anterior
        </Link>
      ) : (
        <span className="px-4 py-2 border border-[#8D62A5] text-[#8D62A5] rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
          ← Anterior
        </span>
      )}

      <span className="text-[#FBDAF9] text-sm">
        Página <span className="text-[#F500F1] font-bold">{paginaActual}</span> de <span className="font-bold">{totalPaginas}</span>
      </span>

      {paginaActual < totalPaginas ? (
        <Link
          href={`${basePath}?page=${paginaActual + 1}`}
          className="px-4 py-2 bg-transparent border border-[#C392DD] text-[#C392DD] rounded-lg hover:bg-[#C392DD] hover:text-white transition-colors text-sm font-medium"
        >
          Siguiente →
        </Link>
      ) : (
        <span className="px-4 py-2 border border-[#8D62A5] text-[#8D62A5] rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
          Siguiente →
        </span>
      )}
    </div>
  );
}