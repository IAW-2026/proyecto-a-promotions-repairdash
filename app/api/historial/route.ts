
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.RIDER_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const { usuarioId, promocionId, trabajoId, valorOriginal, valorPagado } = body;

  if (!usuarioId || !promocionId || !trabajoId || !valorOriginal || !valorPagado) {
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

  return NextResponse.json(historial, { status: 201 });
}