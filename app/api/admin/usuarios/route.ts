
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== 'admin-promotions') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, fechaRegistro: true },
    orderBy: { fechaRegistro: 'desc' },
  });

  return NextResponse.json(usuarios);
}