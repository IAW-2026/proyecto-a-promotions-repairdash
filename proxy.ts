import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sso-callback(.*)',
  '/sin-acceso',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {

  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (role !== 'rider' && role !== 'admin-promotions') {
    return NextResponse.redirect(new URL('/sin-acceso', req.url));
  }

  if (isAdminRoute(req) && role !== 'admin-promotions') {
    return NextResponse.redirect(new URL('/', req.url));
  }

});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};