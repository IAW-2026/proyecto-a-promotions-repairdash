import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminPromotions } from '@/lib/auth';

export async function POST(req: Request) {
  const authError = await requireAdminPromotions();
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
    console.error("Error al crear promoción:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}