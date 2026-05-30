import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    return NextResponse.json({
      status: 'success',
      data: historial
    }, { status: 201 });

  } catch (error) {
    console.error('Error interno al registrar uso de promoción:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}