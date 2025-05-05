import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // update user's auth session and get the response
  let response = await updateSession(request)

  // Create a Supabase client instance for server-side operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // Pass the request and response objects to set cookies
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Ensure response object is available and cookies are set on it
          response = NextResponse.next({ request }) // Recreate response if needed, or use existing
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected and public routes
  const protectedRoutes = ['/account', '/swipe'] // Add other protected routes as needed
  const authRoutes = ['/login', '/signup'] // Routes for unauthenticated users
  const signupProcessRoute = '/signup-steps'

  // --- Redirect Logic ---
  console.log(`[Middleware] Path: ${pathname}, User: ${user?.id ?? 'None'}`); // Log path and user

  if (user) {
    // User is authenticated
    let profileComplete = false
    let profileData = null; // Variable to store profile data for logging
    let profileError = null; // Variable to store profile error for logging

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('age') // Still checking age for now
        .eq('id', user.id)
        .single()
      
      profileData = profile; // Store for logging
      profileError = error; // Store for logging

      if (error && error.code !== 'PGRST116') { 
        console.error('[Middleware] Error fetching profile:', error.message)
      } else {
         // Define profile completion criteria
         if (profile && profile.age !== null) {
            profileComplete = true
         } else if (profile) {
            console.log('[Middleware] Profile found but age is null.');
         } else if (error && error.code === 'PGRST116') {
            console.log('[Middleware] No profile found (PGRST116).');
         }
      }
    } catch (e) {
      console.error('[Middleware] Exception fetching profile:', e.message)
      profileError = e; // Store exception for logging
    }
    
    // Log profile status before redirect logic
    console.log(`[Middleware] User ${user.id}: Profile fetch complete. Data: ${JSON.stringify(profileData)}, Error: ${JSON.stringify(profileError)}, Calculated Complete: ${profileComplete}`);

    // Define routes that REQUIRE a complete profile
    const requiresCompleteProfile = ['/swipe', '/account']; 

    if (profileComplete) {
      // User has a complete profile
      // Redirect away from auth pages, signup steps, or root to the main app
      if (authRoutes.includes(pathname) || pathname === '/' || pathname === signupProcessRoute) {
        console.log(`[Middleware] User ${user.id} with complete profile accessing ${pathname}, redirecting to /swipe`);
        return NextResponse.redirect(new URL('/swipe', request.url));
      }
      // Otherwise, allow access to the requested page (could be /swipe, /account, etc.)

    } else {
      // User has an incomplete profile
      // If they try to access a route that requires a complete profile, redirect to signup steps
      if (requiresCompleteProfile.includes(pathname)) {
         console.log(`[Middleware] User ${user.id} with incomplete profile accessing protected route ${pathname}, redirecting to ${signupProcessRoute}`);
         return NextResponse.redirect(new URL(signupProcessRoute, request.url));
      }
      // Allow access to other pages (like /login, /, or even /signup-steps itself) 
      // if the profile is incomplete and the route doesn't require completion.
    }

  } else {
    // User is not authenticated
    // Redirect protected routes (including signup steps) to login
    const protectedAndSignup = [...protectedRoutes, signupProcessRoute]; // Combine routes needing auth
    if (protectedAndSignup.includes(pathname)) {
      console.log(`[Middleware] Unauthenticated user accessing protected route ${pathname}, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Allow access to public routes (like /, /login)
  }

  // Return the original or modified response
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
}