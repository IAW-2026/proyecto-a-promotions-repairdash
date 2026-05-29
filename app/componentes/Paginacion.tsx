import Link from 'next/link';

type Props = {
  paginaActual: number;
  totalPaginas: number;
  basePath: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

function crearHref(basePath: string, page: number, searchParams?: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (key === 'page' || !value) return;
    const valores = Array.isArray(value) ? value : [value];
    valores.filter(Boolean).forEach((item) => params.append(key, item));
  });
  params.set('page', String(page));

  return `${basePath}?${params.toString()}`;
}

export default function Paginacion({ paginaActual, totalPaginas, basePath, searchParams }: Props) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {paginaActual > 1 ? (
        <Link
          href={crearHref(basePath, paginaActual - 1, searchParams)}
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
          href={crearHref(basePath, paginaActual + 1, searchParams)}
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
