// lib/filtroUsuarios.ts
import { prisma } from '@/lib/prisma';

type FiltroUsuarios = {
  idsEspecificos?: string[];
  registradosDespuesDe?: string;
  registradosAntesDe?: string;
  minimoUsos?: number;
  maximoUsos?: number;
};

export async function usuarioCalifica(usuarioId: string, filtro: FiltroUsuarios | null): Promise<boolean> {
  // si no hay filtro, es para todos
  if (!filtro) return true;

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { historial: true },
  });
  if (!usuario || !usuario.activo) return false;

  if (filtro.idsEspecificos && filtro.idsEspecificos.length > 0) {
    if (!filtro.idsEspecificos.includes(usuarioId)) return false;
  }

  if (filtro.registradosDespuesDe) {
    if (usuario.fechaRegistro < new Date(filtro.registradosDespuesDe)) return false;
  }
  if (filtro.registradosAntesDe) {
    if (usuario.fechaRegistro > new Date(filtro.registradosAntesDe)) return false;
  }

  const cantUsos = usuario.historial.length;
  if (filtro.minimoUsos !== undefined && filtro.minimoUsos !== null) {
    if (cantUsos < filtro.minimoUsos) return false;
  }
  if (filtro.maximoUsos !== undefined && filtro.maximoUsos !== null) {
    if (cantUsos > filtro.maximoUsos) return false;
  }

  return true;
}