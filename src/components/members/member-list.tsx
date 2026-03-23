'use client'
import { useState, useMemo } from 'react'
import { MemberScore } from '@/lib/scoring'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, UserSearch, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function MemberList({ scores }: { scores: MemberScore[] }) {
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState<string>('all')
    const [posFilter, setPosFilter] = useState<string>('all')

    const departments = useMemo(() => {
        const depts = new Set(scores.map(s => s.member.department_code))
        return Array.from(depts).sort()
    }, [scores])

    const positions = useMemo(() => {
        const pos = new Set(scores.map(s => s.member.position_code))
        return Array.from(pos).sort()
    }, [scores])

    const filtered = useMemo(() => {
        return scores.filter(s => {
            const matchSearch = s.member.full_name.toLowerCase().includes(search.toLowerCase())
            const matchDept = deptFilter === 'all' || s.member.department_code === deptFilter
            const matchPos = posFilter === 'all' || s.member.position_code === posFilter
            return matchSearch && matchDept && matchPos
        })
    }, [scores, search, deptFilter, posFilter])

    return (
        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-0">
                <div className="p-4 border-b border-blue-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search member by name..."
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={deptFilter} onValueChange={(v) => v && setDeptFilter(v)}>
                            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950 h-10">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Depts</SelectItem>
                                {departments.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={posFilter} onValueChange={(v) => v && setPosFilter(v)}>
                            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950 h-10">
                                <SelectValue placeholder="Position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                {positions.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/30">
                            <TableRow>
                                <TableHead className="w-[250px] font-semibold text-slate-700 dark:text-slate-300">Member</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Department</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Position</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Tracking Score</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((score) => (
                                <TableRow key={score.member.member_id} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 py-3">
                                        {score.member.full_name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                                            {score.member.department_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {score.member.position_label}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-flex items-center justify-center min-w-12 h-7 font-bold text-blue-700 bg-blue-100/50 rounded-md dark:text-blue-400 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                                            {score.trackingScore}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/members/${score.member.member_id}`}>
                                            <div className="p-2 rounded-md hover:bg-blue-100 text-slate-400 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors cursor-pointer flex justify-center items-center">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 font-medium space-y-2">
                                            <UserSearch className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                            <p>No members match your current filters.</p>
                                        </div>
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
