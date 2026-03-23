import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth transition-all">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
