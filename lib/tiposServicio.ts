export type TipoServicio = {
  id: string;
  nombre: string;
  descripcion?: string;
};

const tiposServicioMock: TipoServicio[] = [
  { id: '1', nombre: 'Plomería', descripcion: 'Reparaciones de cañerías, pérdidas de agua, grifería y sanitarios.' },
  { id: '2', nombre: 'Electricidad', descripcion: 'Instalaciones, diagnóstico de fallas, tomas, tableros y luminarias.' },
  { id: '3', nombre: 'Pintura', descripcion: 'Pintura interior y exterior, preparación de superficies.' },
  { id: '4', nombre: 'Carpintería', descripcion: 'Muebles, puertas, ventanas y estructuras de madera.' },
  { id: '5', nombre: 'Albañilería', descripcion: 'Construcción, reparación y revestimiento de paredes y pisos.' },
];

export async function obtenerTiposServicio(): Promise<TipoServicio[]> {
  /*if (!process.env.NEXT_PUBLIC_DRIVER_APP_URL || !process.env.DRIVER_API_KEY) {
    return tiposServicioMock;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DRIVER_APP_URL}/api/tipos-servicio`, {
      headers: { 'x-api-key': process.env.DRIVER_API_KEY },
      cache: 'no-store',
    });

    if (!res.ok) return tiposServicioMock;

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : json;
  } catch (error) {
    console.error('No se pudieron cargar los tipos de servicio:', error);
    return tiposServicioMock;
  }*/
  return tiposServicioMock;
}
