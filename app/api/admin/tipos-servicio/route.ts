
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { obtenerTiposServicio } from '@/lib/tiposServicio';

export async function GET() {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== 'admin-promotions') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json(await obtenerTiposServicio());
}
