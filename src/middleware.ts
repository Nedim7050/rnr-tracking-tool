import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const isAdminPath = request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/audit-log');

    if (isAdminPath) {
        const session = request.cookies.get('admin_session');
        if (!session || session.value !== 'authenticated') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/settings/:path*', '/audit-log/:path*'],
}
