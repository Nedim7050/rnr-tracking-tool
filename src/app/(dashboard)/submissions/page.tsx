import { getDashboardData } from '@/lib/api'
import { ReviewTable } from '@/components/submissions/review-table'

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage() {
    const data = await getDashboardData().catch(() => null)

    if (!data || !data.submissions) {
        return (
            <div className="flex items-center justify-center p-12 text-center text-slate-500">
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No data available</h2>
                    <p className="mt-2 text-sm">Please check your database connection.</p>
                </div>
            </div>
        )
    }

    // Sort: pending first, then by date descending
    const sorted = [...data.submissions].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.submitted_at || b.event_date || 0).getTime() - new Date(a.submitted_at || a.event_date || 0).getTime();
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Submissions Review</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Review, validate, or reject member proof submissions.</p>
                </div>
            </div>

            <ReviewTable submissions={sorted} />
        </div>
    )
}
