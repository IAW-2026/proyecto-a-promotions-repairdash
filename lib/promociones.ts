type FiltroUsuariosPromo = {
  idsEspecificos?: string[];
};

export function extraerValorUnico(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? valor[0] ?? '' : valor ?? '';
}

export function extraerValoresMultiples(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor.filter(Boolean) : [valor];
}

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function tieneUsuariosEspecificos(filtro: unknown): filtro is FiltroUsuariosPromo {
  return esObjeto(filtro) && Array.isArray(filtro.idsEspecificos) && filtro.idsEspecificos.length > 0;
}

export function coincideFiltroUsuarios(filtro: unknown, modos: string[]): boolean {
  if (modos.length === 0) return true;
  return modos.some((modo) => {
    if (modo === 'todos') return filtro === null;
    if (modo === 'especificos') return tieneUsuariosEspecificos(filtro);
    if (modo === 'filtrados') return esObjeto(filtro) && !tieneUsuariosEspecificos(filtro);
    return true;
  });
}

export function estadoPromocion(
  fechaInicio: Date,
  fechaFin: Date | null,
  ahora: Date
): 'vigente' | 'programada' | 'caducada' {
  if (fechaInicio > ahora) return 'programada';
  if (fechaFin !== null && fechaFin < ahora) return 'caducada';
  return 'vigente';
}