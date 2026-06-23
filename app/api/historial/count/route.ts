import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';

// GET — estadísticas de cantidad de usos del historial
// Accesible con: INTERNAL_SERVICES_API_KEY (para Analytics)
//
// Query params opcionales (todos combinables entre sí):
//   ?promocionId=5         → cuenta usos de esa promoción
//   ?usuarioId=abc123      → cuenta usos de ese usuario
//   ?desde=2026-01-01      → cuenta usos a partir de esa fecha (inclusive)
//   ?hasta=2026-06-01      → cuenta usos hasta esa fecha (inclusive)
export async function GET(req: Request) {
  const authError = await requireSuperAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    // — promocionId —
    const promocionIdParam = searchParams.get('promocionId');
    let promocionId: number | undefined;
    if (promocionIdParam !== null) {
      const parsed = parseInt(promocionIdParam);
      if (isNaN(parsed) || parsed <= 0) {
        return NextResponse.json({ error: 'Parámetro "promocionId" inválido. Debe ser un número entero positivo.' }, { status: 400 });
      }
      promocionId = parsed;
    }

    // — usuarioId —
    const usuarioIdParam = searchParams.get('usuarioId');
    let usuarioId: string | undefined;
    if (usuarioIdParam !== null) {
      if (usuarioIdParam.trim() === '') {
        return NextResponse.json({ error: 'Parámetro "usuarioId" inválido. No puede estar vacío.' }, { status: 400 });
      }
      usuarioId = usuarioIdParam.trim();
    }

    // — desde / hasta —
    const desdeParam = searchParams.get('desde');
    const hastaParam = searchParams.get('hasta');
    let fechaDesde: Date | undefined;
    let fechaHasta: Date | undefined;

    if (desdeParam !== null) {
      fechaDesde = new Date(desdeParam);
      if (isNaN(fechaDesde.getTime())) {
        return NextResponse.json({ error: 'Parámetro "desde" inválido. Use formato YYYY-MM-DD o ISO 8601.' }, { status: 400 });
      }
    }

    if (hastaParam !== null) {
      fechaHasta = new Date(hastaParam);
      if (isNaN(fechaHasta.getTime())) {
        return NextResponse.json({ error: 'Parámetro "hasta" inválido. Use formato YYYY-MM-DD o ISO 8601.' }, { status: 400 });
      }
    }

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      return NextResponse.json({ error: 'El parámetro "desde" no puede ser posterior a "hasta".' }, { status: 400 });
    }

    const where = {
      ...(promocionId !== undefined ? { promocionId } : {}),
      ...(usuarioId   !== undefined ? { usuarioId }   : {}),
      ...((fechaDesde || fechaHasta)
        ? {
            fechaUso: {
              ...(fechaDesde ? { gte: fechaDesde } : {}),
              ...(fechaHasta ? { lte: fechaHasta } : {}),
            },
          }
        : {}),
    };

    const [total, agregados] = await Promise.all([
      prisma.historialDeUso.count({ where }),
      prisma.historialDeUso.aggregate({
        where,
        _sum: {
          valorOriginal: true,
          valorPagado: true,
        },
      }),
    ]);

    const sumaValorOriginal = agregados._sum.valorOriginal ?? 0;
    const sumaValorPagado   = agregados._sum.valorPagado   ?? 0;
    const ahorroTotal       = sumaValorOriginal - sumaValorPagado;

    return NextResponse.json({
      status: 'success',
      data: {
        totalUsos: total,
        sumaValorOriginal,
        sumaValorPagado,
        ahorroTotal,
      },
      filtros: {
        promocionId: promocionId ?? null,
        usuarioId:   usuarioId   ?? null,
        desde:       fechaDesde  ?? null,
        hasta:       fechaHasta  ?? null,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de historial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}