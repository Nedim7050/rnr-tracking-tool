import { getDashboardData } from '@/lib/api'
import { calculateScores } from '@/lib/scoring'
import { VotingTable } from '@/components/voting/voting-table'



export const dynamic = 'force-dynamic'

export default async function VotingPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
    const resolvedParams = await searchParams

    const data = await getDashboardData().catch(() => null)

    if (!data || !data.members) {
        return <div className="p-12 text-center text-slate-500">Database connection required.</div>
    }

    let activePeriod = data.voting_periods?.find(p => p.active)
    if (resolvedParams.period) {
        const found = data.voting_periods?.find(p => p.period_key === resolvedParams.period)
        if (found) activePeriod = found
    }

    const scores = calculateScores(data, activePeriod?.period_key || null)

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Voting Eligibility</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Determine which members are eligible to vote based on attendance and specific actions.
                    </p>
                </div>
                {activePeriod && (
                    <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-lg shadow-sm flex items-center">
                        <span className="font-medium text-lg min-w-[200px] block">
                            Voting Requirement: <span className="font-bold text-emerald-700 dark:text-emerald-300">{activePeriod.min_voting_score} pts</span>
                        </span>
                    </div>
                )}
            </div>

            <VotingTable scores={scores} activePeriod={activePeriod || null} />
        </div>
    )
}
