import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminOSuperAdmin, requireSuperAdmin } from '@/lib/auth';

// POST — crear promoción (sin cambios, solo se agrega requireAdminOSuperAdmin)
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

// GET — listar todas las promociones
// INTERNAL_SERVICES_API_KEY
// Query params opcionales:
//   ?eliminada=true|false  →  por defecto devuelve solo las no eliminadas
//   ?page=1&limit=20       →  paginación (default: page=1, limit=20, max limit=100)
export async function GET(req: Request) {
  const authError = await requireSuperAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    const eliminadaParam = searchParams.get('eliminada');
    const eliminada =
      eliminadaParam === 'true' ? true :
      eliminadaParam === 'false' ? false :
      false;

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const skip = (page - 1) * limit;

    const [promociones, total] = await Promise.all([
      prisma.promocion.findMany({
        where: { eliminada },
        orderBy: { fechaInicio: 'desc' },
        skip,
        take: limit,
      }),
      prisma.promocion.count({ where: { eliminada } }),
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