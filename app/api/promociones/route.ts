// app/api/promociones/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { usuarioCalifica } from '@/lib/filtroUsuarios';

type TipoServicio = {
  id: string;
  nombre: string;
  descripcion: string;
};

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

  // Traemos los tipos de servicio para resolver ids a nombres
  const tiposRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/tipos-servicio`, {
    headers: { 'x-api-key': process.env.RIDER_API_KEY! },
  });
  const tipos: TipoServicio[] = tiposRes.ok ? await tiposRes.json() : [];

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
      usoUnico: true,
    },
  });

  const promociones = await Promise.all(
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
        ...promo,
        categorias: promo.categorias.map(
          (id) => tipos.find((t) => t.id === id)?.nombre ?? id
        ),
        filtroUsuarios: undefined,
        usoUnico: undefined,
      };
    })
  );

  return NextResponse.json(promociones.filter(Boolean));
}