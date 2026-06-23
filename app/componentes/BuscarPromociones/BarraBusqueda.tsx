'use client';

type Props = {
  query: string;
  isPending: boolean;
  onChange: (valor: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function BarraBusqueda({ query, isPending, onChange, onSubmit }: Props) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 lg:flex-[1.5] w-full">
      <label className="text-[11px] font-bold uppercase tracking-wider text-[#C392DD]/80 flex items-center gap-2">
        Buscar Promoción
        {isPending && (
          <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-[#F500F1]" />
        )}
      </label>
      <div className="relative flex items-center w-full">
        <svg className="absolute left-3.5 h-4 w-4 text-[#8D62A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          enterKeyHint="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribí para buscar..."
          className="h-11 w-full rounded-xl border border-[#8D62A5]/40 bg-[#271033]/60 pl-10 pr-12 text-sm text-white outline-none transition-all placeholder:text-[#8D62A5]/70 focus:border-[#F500F1] focus:bg-[#271033] focus:shadow-[0_0_15px_rgba(245,0,241,0.15)]"
        />
        {query.trim().length > 0 && (
          <button
            type="submit"
            onClick={onSubmit}
            className="absolute right-2 flex h-7 w-8 items-center justify-center rounded-lg bg-[#F500F1] text-white hover:bg-[#c400c0] transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-150"
            title="Buscar ahora"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}