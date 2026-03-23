'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(passcode: string) {
    if (passcode === process.env.ADMIN_PASSCODE) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        return { success: true };
    }
    return { success: false, error: 'Invalid passcode' };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/login');
}
