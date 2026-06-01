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

  try {
    const ahora = new Date();
    const todasLasPromos = await prisma.promocion.findMany({
      where: {
        eliminada: false,
        fechaInicio: { lte: ahora },
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: ahora } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        tipoDescuento: true,
        valor: true,
        precioMinimo: true,
        categorias: true,
        filtroUsuarios: true,
        usoUnico: true,
      },
    });
    const promocionesFiltradas = await Promise.all(
      todasLasPromos.map(async (promo) => {
        const califica = await usuarioCalifica(usuarioId, promo.filtroUsuarios as any);
        if (!califica) return null;

        if (promo.usoUnico) {
          const yaUsada = await prisma.historialDeUso.findFirst({
            where: { promocionId: promo.id, usuarioId },
          });
          if (yaUsada) return null;
        }

        return {
          id: promo.id,
          nombre: promo.nombre,
          tipoDescuento: promo.tipoDescuento,
          valor: promo.valor,
          precioMinimo: promo.precioMinimo,
          categorias: promo.categorias, 
        };
      })
    );

    return NextResponse.json({
      status: 'success',
      data: promocionesFiltradas.filter(Boolean)
    });

  } catch (error) {
    console.error('Error interno del servidor:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}