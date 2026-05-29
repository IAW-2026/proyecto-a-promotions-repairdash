export type TipoServicio = {
  id: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
};

export async function obtenerTiposServicio(): Promise<TipoServicio[]> {
  const url = process.env.NEXT_PUBLIC_DRIVER_APP_URL || process.env.DRIVER_APP_URL;
  const apiKey = process.env.DRIVER_API_KEY;

  if (!url || !apiKey) {
    throw new Error('Faltan las variables de entorno de configuración para DriverApp.');
  }

  const res = await fetch(`${url}/api/tipos-servicios`, {
    method: 'GET',
    headers: { 
      'x-api-key': apiKey,
      'Accept': 'application/json'
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Error al mapear DriverApp: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (!json || json.status !== 'success' || !Array.isArray(json.data)) {
    throw new Error('La API respondió pero el formato de datos es inválido.');
  }

  // Mapeo limpio directo de la estructura que entrega su API
  return json.data.map((item: any) => ({
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion,
    precioBase: item.precioBase,
  }));
}