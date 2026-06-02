import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const promo = await prisma.promocion.findUnique({ where: { id: parseInt(id) } });
  return NextResponse.json(promo);
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams 
) {
  try {
    const { id } = await params;
    const idPromocion = parseInt(id);

    if (isNaN(idPromocion)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.promocion.update({
      where: { id: idPromocion },
      data: { eliminada: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar la promo:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
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