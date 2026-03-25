import { getDashboardData, SCRIPT_URL } from '@/lib/api'
import { SubmissionForm } from './submission-form'
import Image from 'next/image'

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
        <div className="relative flex min-h-screen items-center justify-center bg-slate-900/30 p-4 sm:p-6 py-12">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <Image src="/login-bg.jpg" alt="AIESEC Carthage Background" fill className="object-cover opacity-85" priority />
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px]"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-lg mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase drop-shadow-md">AIESEC <span className="text-blue-400">CARTHAGE</span> RNR</h1>
                    <p className="mt-2 text-sm font-medium text-slate-200 drop-shadow">Claim your performance points by submitting proof.</p>
                </div>

                <SubmissionForm members={activeMembers} metrics={activeMetrics} scriptUrl={SCRIPT_URL} />
            </div>
        </div>
    )
}
