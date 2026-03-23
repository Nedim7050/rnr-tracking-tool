'use client'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions/auth'
import { LogOut, UserCircle } from 'lucide-react'

export function Header() {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80 px-6 border-slate-200 dark:border-slate-800 z-10 sticky top-0">
            <div className="text-lg font-medium tracking-tight text-slate-800 dark:text-slate-200">
                Dashboard
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-inner">
                    <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>VPTM Admin</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
                    <LogOut className="h-[18px] w-[18px] mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    )
}
