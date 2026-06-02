import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminPromotions } from '@/lib/auth';
import { auth } from '@clerk/nextjs/server';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado. Iniciá sesión.' }, { status: 401 });
  }

  const { id } = await params;
  const idPromocion = parseInt(id);

  if (isNaN(idPromocion)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const promo = await prisma.promocion.findUnique({ where: { id: idPromocion } });
  return NextResponse.json(promo);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authError = await requireAdminPromotions();
  if (authError) return authError;

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
  const authError = await requireAdminPromotions();
  if (authError) return authError;

  try {
    const { id } = await params;
    const idPromocion = parseInt(id);

    if (isNaN(idPromocion)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { id: _id, ...datos } = body;

    const promo = await prisma.promocion.update({
      where: { id: idPromocion },
      data: {
        nombre: datos.nombre,
        tipoDescuento: datos.tipoDescuento,
        descripcion: datos.descripcion,
        destacada: datos.destacada !== undefined ? Boolean(datos.destacada) : undefined,
        usoUnico: datos.usoUnico !== undefined ? Boolean(datos.usoUnico) : undefined,
        valor: datos.valor !== undefined ? parseFloat(String(datos.valor)) : undefined,
        precioMinimo: datos.precioMinimo !== undefined 
          ? (datos.precioMinimo ? parseFloat(String(datos.precioMinimo)) : null) 
          : undefined,
        categorias: typeof datos.categorias === 'string' 
          ? datos.categorias.split(',').map((c: string) => c.trim()) 
          : datos.categorias,
        fechaInicio: datos.fechaInicio ? new Date(datos.fechaInicio) : undefined,
        fechaFin: datos.fechaFin !== undefined 
          ? (datos.fechaFin ? new Date(datos.fechaFin) : null) 
          : undefined,
        filtroUsuarios: datos.filtroUsuarios !== undefined ? datos.filtroUsuarios : undefined,
      },
    });
    return NextResponse.json(promo);
  } catch (error) {
    console.error("ERROR EN EL PATCH:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}