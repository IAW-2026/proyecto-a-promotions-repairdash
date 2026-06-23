import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminOSuperAdmin, requireSuperAdmin } from '@/lib/auth';

// POST — crear promoción
export async function POST(req: Request) {
  const authError = await requireAdminOSuperAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();

    const promo = await prisma.promocion.create({
      data: {
        nombre: body.nombre,
        tipoDescuento: body.tipoDescuento,
        descripcion: body.descripcion,
        destacada: Boolean(body.destacada),
        usoUnico: Boolean(body.usoUnico),
        categorias: body.categorias ?? [],
        valor: parseFloat(body.valor),
        precioMinimo: body.precioMinimo ? parseFloat(body.precioMinimo) : null,
        fechaInicio: new Date(body.fechaInicio),
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
        filtroUsuarios: body.filtroUsuarios ?? null,
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error('Error al crear promoción:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET — listar promociones
//
// Sin query params → devuelve todas las no eliminadas
//
// Query param opcional (no combinable con otros):
//   ?estado=eliminadas   → promociones eliminadas
//   ?estado=vigentes     → no eliminadas, fechaInicio <= ahora, (fechaFin null o >= ahora)
//   ?estado=programadas  → no eliminadas, fechaInicio > ahora
//   ?estado=vencidas     → no eliminadas, fechaFin < ahora
//
// Paginación:
//   ?page=1&limit=20  (default: page=1, limit=20, max limit=100)
export async function GET(req: Request) {
  const authError = await requireSuperAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const ahora = new Date();

    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const skip  = (page - 1) * limit;

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

    // Por defecto: todas las no eliminadas
    const where = estadoParam
      ? whereMap[estadoParam as Estado]
      : { eliminada: false };

    const [promociones, total] = await Promise.all([
      prisma.promocion.findMany({
        where,
        orderBy: { fechaInicio: 'desc' },
        skip,
        take: limit,
      }),
      prisma.promocion.count({ where }),
    ]);

    return NextResponse.json({
      status: 'success',
      data: promociones,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}