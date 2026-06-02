
import { currentUser } from '@clerk/nextjs/server';

export async function obtenerRol() {
  const user = await currentUser();
  if (!user) return null;
  return (user.publicMetadata?.role as string) ?? 'cliente';
}

export async function esAdmin() {
  const user = await currentUser();
  return user?.publicMetadata?.rolPromociones === 'admin';
}