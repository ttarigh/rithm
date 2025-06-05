import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/account', '/swipe'];
  const authRoutes = ['/login', '/signup'];
  const signupProcessRoute = '/signup-steps';

  console.log(`[Middleware] Path: ${pathname}, User: ${user?.id ?? 'None'}`);

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('age')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Middleware] Error fetching profile:', error.message);
    }

    const profileComplete = profile && profile.age !== null;
    const requiresCompleteProfile = ['/swipe', '/account'];

    if (profileComplete) {
      if (authRoutes.includes(pathname) || pathname === '/' || pathname === signupProcessRoute) {
        console.log(`[Middleware] User ${user.id} with complete profile on ${pathname}, redirecting to /swipe`);
        return NextResponse.redirect(new URL('/swipe', request.url));
      }
    } else {
      if (requiresCompleteProfile.includes(pathname)) {
        console.log(`[Middleware] User ${user.id} with incomplete profile on ${pathname}, redirecting to ${signupProcessRoute}`);
        return NextResponse.redirect(new URL(signupProcessRoute, request.url));
      }
    }
  } else {
    const protectedAndSignup = [...protectedRoutes, signupProcessRoute];
    if (protectedAndSignup.includes(pathname)) {
      console.log(`[Middleware] Unauthenticated user on ${pathname}, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};