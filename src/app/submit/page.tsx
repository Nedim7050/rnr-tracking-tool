import { getDashboardData, SCRIPT_URL } from '@/lib/api'
import { SubmissionForm } from './submission-form'

export const dynamic = 'force-dynamic'

export default async function SubmitActionPage() {
    const data = await getDashboardData().catch(() => null)

    if (!data) return <div className="flex h-screen items-center justify-center text-slate-500">System offline. Cannot load submission forms.</div>

    const activeMembers = data.members?.filter(m => m.active) || []

    // Admin-only metrics are excluded: members can NOT submit these themselves
    // They are managed by the VP/Admin in the Admin Settings panel
    const ADMIN_ONLY_METRIC_NAMES = ['oc performance', '% target list fulfillment', 'target list fulfillment']
    const activeMetrics = data.metrics?.filter(m =>
        m.active &&
        !ADMIN_ONLY_METRIC_NAMES.some(name => m.metric_name.toLowerCase().includes(name))
    ) || []

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-12 px-4 sm:px-6">
            <div className="w-full max-w-lg mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">RnR Submission Tracker</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Submit your proofs to claim performance points.</p>
                </div>

                <SubmissionForm members={activeMembers} metrics={activeMetrics} scriptUrl={SCRIPT_URL} />
            </div>
        </div>
    )
}
