'use client'
import { MemberScore } from '@/lib/scoring'
import { DashboardData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileClock, Trophy, TrendingUp } from 'lucide-react'

export function DashboardMetrics({ scores, data }: { scores: MemberScore[], data: DashboardData }) {
    const pendingSubmissions = data.submissions?.filter(s => s.status === 'pending').length || 0
    const activeMembers = scores.filter(s => s.member.active).length
    const eligibleVoters = scores.filter(s => s.isEligibleForVoting).length

    const topScore = scores.length > 0 ? scores[0].trackingScore : 0

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Members</CardTitle>
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{activeMembers}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active in Carthage</p>
                </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Highest Score</CardTitle>
                    <Trophy className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{topScore}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current Leader</p>
                </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Pending Approvals</CardTitle>
                    <FileClock className={`h-5 w-5 ${pendingSubmissions > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{pendingSubmissions}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Validations waiting</p>
                </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Eligible Voters</CardTitle>
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{eligibleVoters}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Met voting threshold</p>
                </CardContent>
            </Card>
        </div>
    )
}
