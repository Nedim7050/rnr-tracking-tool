'use client'
import { MemberScore } from '@/lib/scoring'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function Leaderboard({ scores }: { scores: MemberScore[] }) {
    // Show top 10 on dashboard
    const topScores = scores.slice(0, 10)

    return (
        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md h-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Overall Leaderboard</CardTitle>
                <CardDescription>Top 10 performing members across all departments</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="w-[80px] font-semibold">Rank</TableHead>
                                <TableHead className="font-semibold">Member</TableHead>
                                <TableHead className="font-semibold">Department</TableHead>
                                <TableHead className="font-semibold">Position</TableHead>
                                <TableHead className="text-right font-semibold">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topScores.map((score, idx) => (
                                <TableRow key={score.member.member_id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <TableCell className="font-semibold text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                                            {idx + 1}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{score.member.full_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 shadow-sm">
                                            {score.member.department_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                                            {score.member.position_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-block font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md dark:text-blue-400 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shadow-sm">
                                            {score.trackingScore}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {topScores.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                                        No active score data recorded.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
