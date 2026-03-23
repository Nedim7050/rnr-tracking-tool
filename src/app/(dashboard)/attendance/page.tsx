import { getDashboardData } from '@/lib/api'
import { AttendanceTracker } from '@/components/attendance/attendance-tracker'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
    const data = await getDashboardData().catch(() => null)

    if (!data || !data.members) {
        return (
            <div className="flex items-center justify-center p-12 text-center text-slate-500">
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No data available</h2>
                    <p className="mt-2 text-sm">Please check your database connection.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance System</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Create events and record member attendance. This data automatically impacts voting eligibility scores.
                </p>
            </div>

            <AttendanceTracker members={data.members.filter(m => m.active)} events={data.events || []} attendance={data.attendance || []} activePeriod={data.voting_periods?.find(p => p.active)} />
        </div>
    )
}
