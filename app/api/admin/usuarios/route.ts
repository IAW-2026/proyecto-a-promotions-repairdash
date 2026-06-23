import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, fechaRegistro: true },
      orderBy: { fechaRegistro: 'desc' },
    });

    return NextResponse.json({ status: 'success', data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}