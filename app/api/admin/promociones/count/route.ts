import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';

// GET — cantidad de promociones por estado
//
// Sin query params → cantidad de promociones no eliminadas
//
// Query param opcional:
//   ?estado=eliminadas   → cantidad de promociones eliminadas
//   ?estado=vigentes     → no eliminadas, fechaInicio <= ahora, (fechaFin null o >= ahora)
//   ?estado=programadas  → no eliminadas, fechaInicio > ahora
//   ?estado=vencidas     → no eliminadas, fechaFin < ahora
//
// Una promoción eliminada nunca se cuenta como vigente, programada ni vencida.
export async function GET(req: Request) {
  const authError = await requireSuperAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const ahora = new Date();

    const ESTADOS_VALIDOS = ['eliminadas', 'vigentes', 'programadas', 'vencidas'] as const;
    type Estado = typeof ESTADOS_VALIDOS[number];

    const estadoParam = searchParams.get('estado');

    if (estadoParam !== null && !ESTADOS_VALIDOS.includes(estadoParam as Estado)) {
      return NextResponse.json(
        { error: 'Parámetro "estado" inválido. Use: eliminadas, vigentes, programadas o vencidas' },
        { status: 400 }
      );
    }

    const whereMap: Record<Estado, object> = {
      eliminadas:  { eliminada: true },
      vigentes:    { eliminada: false, fechaInicio: { lte: ahora }, OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }] },
      programadas: { eliminada: false, fechaInicio: { gt: ahora } },
      vencidas:    { eliminada: false, fechaFin: { lt: ahora } },
    };

    // Por defecto: cantidad de no eliminadas
    const where = estadoParam
      ? whereMap[estadoParam as Estado]
      : { eliminada: false };

    const cantidad = await prisma.promocion.count({ where });

    return NextResponse.json({
      status: 'success',
      data: { cantidad },
    });
  } catch (error) {
    console.error('Error al obtener cantidad de promociones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}