import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't need authentication
    // /submit is public so members can submit their work
    // /login is where users authenticate
    const publicRoutes = ['/login', '/submit', '/api'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Check if the user is authenticated
    const sessionToken = request.cookies.get('admin_session')?.value;
    const isAuthenticated = sessionToken === 'authenticated';

    // Redirect root to login
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect all other routes (dashboard, members, settings, etc)
    if (!isPublicRoute && !isAuthenticated) {
        // Redirect to login but keep the original URL to redirect back after login? 
        // For simplicity now just redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    // Run middleware on all paths except static assets and internal next.js paths
    matcher: ['/((?!_next/static|_next/image|favicon.ico|login-bg.jpg).*)'],
}
