'use client'
import { useState } from 'react'
import { MemberScore } from '@/lib/scoring'
import { VotingPeriod } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Search, Download } from 'lucide-react'

export function VotingTable({ scores, activePeriod }: { scores: MemberScore[], activePeriod: VotingPeriod | null }) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'eligible' | 'not_eligible'>('all')

    const filtered = scores.filter(s => {
        const matchSearch = s.member.full_name.toLowerCase().includes(search.toLowerCase())
        const matchEligible = filter === 'all' ||
            (filter === 'eligible' && s.isEligibleForVoting) ||
            (filter === 'not_eligible' && !s.isEligibleForVoting)
        return matchSearch && matchEligible
    })

    const exportCSV = () => {
        const headers = ['Member Name', 'Department', 'Position', 'Voting Raw Score', 'Eligible']
        const csvContent = [headers.join(',')]

        filtered.forEach(s => {
            csvContent.push([
                `"${s.member.full_name}"`,
                `"${s.member.department_label}"`,
                `"${s.member.position_label}"`,
                s.votingRawScore,
                s.isEligibleForVoting ? 'Yes' : 'No'
            ].join(','))
        })

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `AIESEC_Voting_Eligibility_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-0">
                <div className="p-4 border-b border-blue-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search member..."
                                className="pl-9 bg-white dark:bg-slate-950 h-10 border-slate-200 dark:border-slate-800"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>All</button>
                            <button onClick={() => setFilter('eligible')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${filter === 'eligible' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                <CheckCircle2 className="h-3.5 w-3.5 hidden sm:inline" /> Eligible
                            </button>
                            <button onClick={() => setFilter('not_eligible')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${filter === 'not_eligible' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                                <XCircle className="h-3.5 w-3.5 hidden sm:inline" /> Not Eligible
                            </button>
                        </div>
                    </div>
                    <Button onClick={exportCSV} variant="outline" className="gap-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/30">
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="text-right">Voting Raw Score</TableHead>
                                <TableHead className="text-center">Eligibility</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((score) => (
                                <TableRow key={score.member.member_id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${score.isEligibleForVoting ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : ''}`}>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 py-4">
                                        <div className="flex flex-col">
                                            <span>{score.member.full_name}</span>
                                            <span className="text-xs text-slate-500 mt-0.5 font-normal">{score.member.position_label}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                            {score.member.department_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-block font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded dark:text-slate-300 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            {score.votingRawScore}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {score.isEligibleForVoting ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full font-bold text-xs border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                                <CheckCircle2 className="h-4 w-4" /> ELIGIBLE
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-bold text-xs border border-red-200 dark:border-red-900 shadow-sm">
                                                <XCircle className="h-4 w-4" /> NOT ELIGIBLE
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500 font-medium">
                                        No matching members found.
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
