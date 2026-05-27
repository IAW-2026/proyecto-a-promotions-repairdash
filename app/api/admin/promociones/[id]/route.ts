import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const promo = await prisma.promocion.findUnique({ where: { id: parseInt(id) } });
  return NextResponse.json(promo);
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { id: _id, ...datos } = body;

    const promo = await prisma.promocion.update({
      where: { id: parseInt(id) },
      data: {
        ...datos,
        valor: parseFloat(datos.valor),
        precioMinimo: datos.precioMinimo ? parseFloat(datos.precioMinimo) : null,
        categorias: typeof datos.categorias === 'string' 
          ? datos.categorias.split(',').map((c: string) => c.trim()) 
          : datos.categorias
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("ERROR EN EL PATCH:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
