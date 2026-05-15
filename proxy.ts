import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sso-callback(.*)', '/sin-acceso']);

export default clerkMiddleware(async (auth, req) => {
  // Rutas públicas pasan directo
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();
  const rol = (sessionClaims?.metadata as { rol?: string })?.rol;
  console.log('sessionClaims completo:', JSON.stringify(sessionClaims, null, 2));
  console.log('rol:', rol);
  // Si no está logueado, al login
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Si está logueado pero no tiene rol válido para esta app, al login
  if (rol !== 'rider' && rol !== 'adminPromociones') {
    return NextResponse.redirect(new URL('/sin-acceso', req.url));
  }

  // Si es ruta admin y no es adminPromociones, al inicio
  if (isAdminRoute(req) && rol !== 'adminPromociones') {
    return NextResponse.redirect(new URL('/', req.url));
  }

});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};