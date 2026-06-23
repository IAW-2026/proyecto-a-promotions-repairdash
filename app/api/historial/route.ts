import { requireSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST — registrar uso (sin cambios)
export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.RIDER_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { usuarioId, promocionId, trabajoId, valorOriginal, valorPagado } = body;

    if (!usuarioId || !promocionId || !trabajoId || valorOriginal === undefined || valorPagado === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const promocion = await prisma.promocion.findUnique({
      where: { id: promocionId },
    });

    if (!promocion) {
      return NextResponse.json({ error: 'Promoción no encontrada' }, { status: 404 });
    }

    const historial = await prisma.historialDeUso.create({
      data: {
        usuarioId,
        promocionId,
        trabajoId,
        nombre: promocion.nombre,
        valorOriginal,
        valorPagado,
      },
    });

    return NextResponse.json({ status: 'success', data: historial }, { status: 201 });
  } catch (error) {
    console.error('Error interno al registrar uso de promoción:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET — consultar historial de uso
// Accesible por: SuperAdmin
//
// Query params opcionales (todos combinables entre sí):
//   ?promocionId=5         → filtra por promoción
//   ?usuarioId=abc123      → filtra por usuario
//   ?desde=2026-01-01      → filtra desde esa fecha (inclusive)
//   ?hasta=2026-06-01      → filtra hasta esa fecha (inclusive)
//   ?page=1&limit=20       → paginación (default: page=1, limit=20, max limit=100)
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

    // — page / limit —
    const pageParam  = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const pageRaw  = pageParam  !== null ? parseInt(pageParam)  : 1;
    const limitRaw = limitParam !== null ? parseInt(limitParam) : 20;

    if (pageParam !== null && (isNaN(pageRaw) || pageRaw < 1)) {
      return NextResponse.json({ error: 'Parámetro "page" inválido. Debe ser un número entero mayor a 0.' }, { status: 400 });
    }
    if (limitParam !== null && (isNaN(limitRaw) || limitRaw < 1)) {
      return NextResponse.json({ error: 'Parámetro "limit" inválido. Debe ser un número entero mayor a 0.' }, { status: 400 });
    }

    const page  = pageRaw;
    const limit = Math.min(100, limitRaw);
    const skip  = (page - 1) * limit;

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

    const [registros, total] = await Promise.all([
      prisma.historialDeUso.findMany({
        where,
        orderBy: { fechaUso: 'desc' },
        skip,
        take: limit,
        include: {
          promocion: {
            select: { id: true, nombre: true, tipoDescuento: true, valor: true },
          },
        },
      }),
      prisma.historialDeUso.count({ where }),
    ]);

    return NextResponse.json({
      status: 'success',
      data: registros,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}