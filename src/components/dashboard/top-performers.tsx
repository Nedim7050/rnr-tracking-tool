'use client'
import { MemberScore } from '@/lib/scoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'

export function TopPerformers({ scores }: { scores: MemberScore[] }) {
    const deptMap = new Map<string, MemberScore>()
    scores.forEach(s => {
        const dept = s.member.department_code
        if (!deptMap.has(dept) || s.trackingScore > deptMap.get(dept)!.trackingScore) {
            deptMap.set(dept, s)
        }
    })

    const topByDept = Array.from(deptMap.values())
        .sort((a, b) => b.trackingScore - a.trackingScore)
        .slice(0, 5)

    const posMap = new Map<string, MemberScore>()
    scores.forEach(s => {
        const pos = s.member.position_code
        if (!posMap.has(pos) || s.trackingScore > posMap.get(pos)!.trackingScore) {
            posMap.set(pos, s)
        }
    })

    const topByPos = Array.from(posMap.values())
        .sort((a, b) => b.trackingScore - a.trackingScore)

    return (
        <div className="space-y-6 h-full">
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 backdrop-blur-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-emerald-900/20 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="pb-3 border-b border-emerald-100 dark:border-emerald-900/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                        <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> Best By Department
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        {topByDept.map((s, i) => (
                            <div key={s.member.member_id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${i === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500'} font-bold text-sm shadow-sm`}>
                                        {i === 0 ? '1' : i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{s.member.full_name}</span>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.member.department_label}</span>
                                    </div>
                                </div>
                                <Badge className="bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm font-bold">
                                    {s.trackingScore}
                                </Badge>
                            </div>
                        ))}
                        {topByDept.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No data</p>}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-purple-100 bg-gradient-to-br from-purple-50/50 to-purple-100/30 backdrop-blur-sm dark:border-purple-900/40 dark:from-purple-950/40 dark:to-purple-900/20 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="pb-3 border-b border-purple-100 dark:border-purple-900/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-800 dark:text-purple-400">
                        <Star className="h-5 w-5 text-purple-600 dark:text-purple-500" /> Best By Position
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        {topByPos.map((s, i) => (
                            <div key={s.member.member_id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{s.member.full_name}</span>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.member.position_label}</span>
                                    </div>
                                </div>
                                <Badge className="bg-white text-purple-700 hover:bg-purple-50 dark:bg-slate-900 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-sm font-bold">
                                    {s.trackingScore}
                                </Badge>
                            </div>
                        ))}
                        {topByPos.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No data</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
