'use client'

import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    History,
    Vote,
    Settings,
    FileText,
    ShieldAlert,
    CalendarCheck,
    Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Submissions', href: '/submissions', icon: History },
    { name: 'Voting Board', href: '/voting', icon: Trophy },
    { name: 'Events & Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Sanctions', href: '/sanctions', icon: ShieldAlert },
    { name: 'Settings', href: '/admin', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="flex h-16 items-center border-b px-6 border-slate-200 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 dark:text-blue-400">
                    <Vote className="h-6 w-6" />
                    <span className="tracking-tight">AIESEC RNR</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1 px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                        isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-2 py-1.5">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">AD</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Admin User</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Carthage Office</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
