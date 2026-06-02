import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const promo = await prisma.promocion.create({ data: body });
  return NextResponse.json(promo, { status: 201 });
}