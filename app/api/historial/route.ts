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
// Accesible por: INTERNAL_SERVICES_API_KEY (Control Plane, Analytics)
//
// Query params opcionales:
//   ?promocionId=5         → filtra por promoción
//   ?usuarioId=abc123      → filtra por usuario
//   ?page=1&limit=50       → paginación (default: page=1, limit=20)
export async function GET(req: Request) {
  const authError = await requireSuperAdmin(req);
    if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    const promocionId = searchParams.get('promocionId');
    const usuarioId = searchParams.get('usuarioId');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const skip = (page - 1) * limit;

    const where = {
      ...(promocionId ? { promocionId: parseInt(promocionId) } : {}),
      ...(usuarioId ? { usuarioId } : {}),
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