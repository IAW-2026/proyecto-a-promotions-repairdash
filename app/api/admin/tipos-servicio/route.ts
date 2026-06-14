import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { obtenerTiposServicio } from '@/lib/tiposServicio';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const tipos = await obtenerTiposServicio();
  return NextResponse.json({ status: 'success', data: tipos });
}