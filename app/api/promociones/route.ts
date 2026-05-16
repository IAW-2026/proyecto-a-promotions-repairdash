import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { usuarioCalifica } from '@/lib/filtroUsuarios';

export async function GET(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.RIDER_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const usuarioId = searchParams.get('usuarioId');

  if (!usuarioId) {
    return NextResponse.json({ error: 'Falta usuarioId' }, { status: 400 });
  }

  const todasLasPromos = await prisma.promocion.findMany({
    where: { eliminada: false },
    select: {
      id: true,
      nombre: true,
      codigo: true,
      tipoDescuento: true,
      valor: true,
      precioMinimo: true,
      categorias: true,
      filtroUsuarios: true,
    },
  });

  const promociones = await Promise.all(
    todasLasPromos.map(async (promo) => {
      const califica = await usuarioCalifica(usuarioId, promo.filtroUsuarios as any);
      return califica ? promo : null;
    })
  );

  return NextResponse.json(promociones.filter(Boolean));
}