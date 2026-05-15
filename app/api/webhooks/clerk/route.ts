// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No hay webhook secret configurado' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Faltan headers de svix' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { id, first_name, last_name, email_addresses, public_metadata } = evt.data;
    const rol = (public_metadata as { rol?: string })?.rol;

    if (rol === 'rider') {
      const nombre = [first_name, last_name].filter(Boolean).join(' ')
        || email_addresses[0]?.email_address
        || 'Sin nombre';

      await prisma.usuario.create({
        data: { id, nombre },
      });
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await prisma.usuario.updateMany({
        where: { id },
        data: { activo: false },
      });
    }
  }

  if (evt.type === 'user.updated') {
    const { id, first_name, last_name, email_addresses, public_metadata } = evt.data;
    const rol = (public_metadata as { rol?: string })?.rol;

    if (rol === 'rider') {
      const nombre = [first_name, last_name].filter(Boolean).join(' ')
        || email_addresses[0]?.email_address
        || 'Sin nombre';

      await prisma.usuario.upsert({
        where: { id },
        update: { activo: true, nombre },
        create: { id, nombre },
      });
    } else {
      // le sacaron el rol rider o tenía otro rol, lo marcamos inactivo si existía
      await prisma.usuario.updateMany({
        where: { id },
        data: { activo: false },
      });
    }
  }

  return NextResponse.json({ ok: true });
}