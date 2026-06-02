
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function obtenerRol() {
  const user = await currentUser();
  if (!user) return null;
  return (user.publicMetadata?.role as string) ?? 'cliente';
}

export async function requireAdminPromotions() {
  const role = await obtenerRol();
  
  if (role !== 'admin-promotions') {
    return NextResponse.json({ error: 'No autorizado. Se requieren permisos de administrador de promociones.' }, { status: 403 });   }
  return null;
}