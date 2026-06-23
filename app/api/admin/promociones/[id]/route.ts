import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminOSuperAdmin } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET — detalle completo de una promoción para admin/servicios
// Devuelve todos los campos incluyendo filtroUsuarios, eliminada, etc.
export async function GET(req: Request, { params }: RouteParams) {
  const authError = await requireAdminOSuperAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const idPromocion = parseInt(id);

  if (isNaN(idPromocion)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const promo = await prisma.promocion.findUnique({
    where: { id: idPromocion },
  });

  if (!promo) {
    return NextResponse.json({ error: 'Promoción no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ status: 'success', data: promo });
}

// DELETE — soft delete
export async function DELETE(_req: Request, { params }: RouteParams) {
  const authError = await requireAdminOSuperAdmin(_req);
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

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error al eliminar la promo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH — editar promoción
export async function PATCH(req: Request, { params }: RouteParams) {
  const authError = await requireAdminOSuperAdmin(req);
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
        precioMinimo:
          datos.precioMinimo !== undefined
            ? datos.precioMinimo
              ? parseFloat(String(datos.precioMinimo))
              : null
            : undefined,
        categorias:
          typeof datos.categorias === 'string'
            ? datos.categorias.split(',').map((c: string) => c.trim())
            : datos.categorias,
        fechaInicio: datos.fechaInicio ? new Date(datos.fechaInicio) : undefined,
        fechaFin:
          datos.fechaFin !== undefined
            ? datos.fechaFin
              ? new Date(datos.fechaFin)
              : null
            : undefined,
        filtroUsuarios: datos.filtroUsuarios !== undefined ? datos.filtroUsuarios : undefined,
      },
    });

    return NextResponse.json({ status: 'success', data: promo });
  } catch (error) {
    console.error('Error en PATCH promoción:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}