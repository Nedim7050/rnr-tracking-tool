import { getDashboardData, SCRIPT_URL } from '@/lib/api'
import { calculateScores } from '@/lib/scoring'
import { SetupGuide } from '@/components/dashboard/setup-guide'
import { DashboardMetrics } from '@/components/dashboard/metrics'
import { Leaderboard } from '@/components/dashboard/leaderboard'
import { TopPerformers } from '@/components/dashboard/top-performers'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    let data = null;
    let error = null;

    try {
        data = await getDashboardData()
    } catch (err: any) {
        error = err.message
    }

    // If SCRIPT_URL is placeholder or data is totally missing, show Setup Guide
    if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_GAS_WEB_APP") || error || !data || !data.members) {
        return <SetupGuide error={error} />
    }

    const scores = calculateScores(data)

    return (
        <div className="space-y-8 tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Overview Snapshot</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome to the AIESEC Carthage performance tracking dashboard.</p>
                </div>
            </div>

            <DashboardMetrics scores={scores} data={data} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <Leaderboard scores={scores} />
                </div>
                <div>
                    <TopPerformers scores={scores} />
                </div>
            </div>
        </div>
    )
}
