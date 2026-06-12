import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function obtenerRol() {
  const user = await currentUser();
  if (!user) return null;
  return (user.publicMetadata?.role as string) ?? 'cliente';
}

// Solo admin Clerk con rol admin-promotions
export async function requireAdmin(): Promise<NextResponse | null> {
  const role = await obtenerRol();
  if (!role) {
    return NextResponse.json({ error: 'No autorizado. Iniciá sesión.' }, { status: 401 });
  }
  if (role !== 'admin-promotions') {
    return NextResponse.json({ error: 'Acceso restringido a administradores de promociones.' }, { status: 403 });
  }
  return null;
}

// Solo service key (Control Plane, Analytics)
export function requireSuperAdmin(req: Request): NextResponse | null {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey === process.env.INTERNAL_SERVICES_API_KEY) return null;
  return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
}

// Admin Clerk O service key
export async function requireAdminOSuperAdmin(req: Request): Promise<NextResponse | null> {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey && apiKey === process.env.INTERNAL_SERVICES_API_KEY) return null;
  return requireAdmin();
}