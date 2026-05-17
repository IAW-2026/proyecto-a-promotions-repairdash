
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role;
  if (role !== 'admin-promotions') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Mockeado hasta que se conecten las apps
  const tiposServicio = [
    { id: '1', nombre: 'Plomería', descripcion: 'Reparaciones de cañerías, pérdidas de agua, grifería y sanitarios.' },
    { id: '2', nombre: 'Electricidad', descripcion: 'Instalaciones, diagnóstico de fallas, tomas, tableros y luminarias.' },
    { id: '3', nombre: 'Pintura', descripcion: 'Pintura interior y exterior, preparación de superficies.' },
    { id: '4', nombre: 'Carpintería', descripcion: 'Muebles, puertas, ventanas y estructuras de madera.' },
    { id: '5', nombre: 'Albañilería', descripcion: 'Construcción, reparación y revestimiento de paredes y pisos.' },
  ];

  // Cuando se conecten las apps, reemplazo el mock con esto:
  // const res = await fetch(`${process.env.DRIVER_APP_URL}/api/tipos-servicio`, {
  //   headers: { 'x-api-key': process.env.DRIVER_API_KEY! },
  // });
  // const json = await res.json();
  // return NextResponse.json(json.data);

  return NextResponse.json(tiposServicio);
}