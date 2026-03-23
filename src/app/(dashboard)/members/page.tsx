import { getDashboardData } from '@/lib/api'
import { calculateScores } from '@/lib/scoring'
import { MemberList } from '@/components/members/member-list'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
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

    const scores = calculateScores(data)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Members Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and filter the AIESEC Carthage membership tracking list.</p>
                </div>
            </div>

            <MemberList scores={scores} />
        </div>
    )
}
