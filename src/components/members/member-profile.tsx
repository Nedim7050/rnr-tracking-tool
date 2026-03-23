'use client'
import { MemberScore } from '@/lib/scoring'
import { Submission } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Printer, CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MemberProfile({ score, submissions, allAttendance = [], allEvents = [] }: { score: MemberScore, submissions: Submission[], allAttendance?: any[], allEvents?: any[] }) {

    const handlePrint = () => {
        window.print()
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
            case 'flagged_duplicate': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            default: return <Clock className="h-4 w-4 text-blue-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30'
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'
            case 'flagged_duplicate': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30'
            default: return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30'
        }
    }

    // Group Details safely
    const breakdownGroups = [
        { title: 'General JD', data: score.breakdown.generalDetails, total: score.breakdown.totals.general },
        { title: 'Leadership JD', data: score.breakdown.leadershipDetails, total: score.breakdown.totals.leadership },
        { title: 'Department JD', data: score.breakdown.departmentDetails, total: score.breakdown.totals.department },
        { title: 'Voting Actions', data: score.breakdown.votingDetails, total: score.breakdown.totals.voting },
        { title: 'Attendance', data: score.breakdown.attendanceDetails, total: 0 },
        { title: 'Sanctions', data: score.breakdown.sanctionsDetails, total: 0 }
    ]

    return (
        <div className="space-y-6 print:m-0 print:p-0">
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Member Performance Profile</h2>
                <Button variant="outline" onClick={handlePrint} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400">
                    <Printer className="h-4 w-4" /> Print Report
                </Button>
            </div>

            {/* Header Card */}
            <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm print:shadow-none print:border-slate-300">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{score.member.full_name}</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-sm px-3 py-1 bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                    {score.member.department_label}
                                </Badge>
                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {score.member.position_label}
                                </Badge>
                            </div>
                            {/* Personal Infos Expand */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <div><span className="font-semibold block text-slate-900 dark:text-slate-200">Private Code:</span> {score.member.member_code}</div>
                                <div><span className="font-semibold block text-slate-900 dark:text-slate-200">Email:</span> {score.member.email || 'N/A'}</div>
                                <div><span className="font-semibold block text-slate-900 dark:text-slate-200">Phone:</span> {score.member.phone || 'N/A'}</div>
                                <div><span className="font-semibold block text-slate-900 dark:text-slate-200">Joined:</span> {score.member.created_at ? new Date(score.member.created_at).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            {score.member.fb_link && (
                                <div className="mt-3 text-sm">
                                    <a href={score.member.fb_link} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">Facebook Profile <ExternalLink className="h-3 w-3" /></a>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-4 dark:bg-slate-800/50 dark:border-slate-700 print:border-slate-300 min-w-[140px]">
                                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tracking Score</div>
                                <div className="text-4xl font-black text-blue-600 dark:text-blue-400">{score.trackingScore}</div>
                            </div>

                            <div className={`text-center border rounded-xl p-4 min-w-[140px] ${score.isEligibleForVoting ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/50'} print:border-slate-300`}>
                                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Voting Status</div>
                                <div className={`text-xl font-bold mt-2 ${score.isEligibleForVoting ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {score.isEligibleForVoting ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                                </div>
                                <div className="text-xs font-medium text-slate-500 mt-1">Raw: {score.votingRawScore} pts</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {breakdownGroups.map(group => {
                    if (group.data.length === 0) return null;
                    return (
                        <Card key={group.title} className="shadow-sm border-slate-200 dark:border-slate-800 print:break-inside-avoid">
                            <CardHeader className="py-4 border-b bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">{group.title}</CardTitle>
                                    {group.total > 0 && <Badge variant="secondary">{group.total} pts</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {group.data.map((item, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <TableCell className="py-2 text-sm">{item.name}</TableCell>
                                                <TableCell className="py-2 text-right font-medium text-sm text-slate-600 dark:text-slate-300">
                                                    {item.points > 0 ? `+${item.points}` : item.points}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {score.breakdown.vpNote !== 0 && (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 print:border-slate-300">
                    <CardContent className="p-4 flex justify-between items-center">
                        <span className="font-semibold text-amber-900 dark:text-amber-500">Board VP Note Modifier</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{score.breakdown.vpNote > 0 ? `+${score.breakdown.vpNote}` : score.breakdown.vpNote} pts</span>
                    </CardContent>
                </Card>
            )}

            {/* Submission Evidence History */}
            <h3 className="text-xl font-bold mt-10 mb-4 print:mt-6 text-slate-800 dark:text-slate-100 border-b pb-2 border-slate-200 dark:border-slate-800">Submission History</h3>
            {submissions.length === 0 ? (
                <p className="text-slate-500 text-sm">No submissions recorded.</p>
            ) : (
                <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden print:border-slate-300 print:break-inside-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Metric</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Evidence</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((sub, i) => (
                                <TableRow key={i} className="print:break-inside-avoid">
                                    <TableCell className="text-sm whitespace-nowrap">{new Date(sub.submitted_at || sub.event_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {sub.metric_name}
                                        {sub.subtype && <span className="text-xs text-slate-400 ml-2">({sub.subtype})</span>}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {sub.quantity ? `x${sub.quantity}` : (sub.percent_value ? `${sub.percent_value}%` : (sub.manual_score ? sub.manual_score : 'Done'))}
                                    </TableCell>
                                    <TableCell>
                                        {sub.proof_url ? (
                                            <a href={sub.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
                                                {sub.proof_type || 'Link'} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">No link</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize flex inline-flex items-center gap-1 w-fit ${getStatusColor(sub.status)}`}>
                                            {getStatusIcon(sub.status)}
                                            <span className="hidden sm:inline">{sub.status.replace('_', ' ')}</span>
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Attendance History */}
            {allEvents.length > 0 && (
                <>
                    <h3 className="text-xl font-bold mt-10 mb-4 print:mt-6 text-slate-800 dark:text-slate-100 border-b pb-2 border-slate-200 dark:border-slate-800">Event Attendance</h3>
                    {allAttendance.filter(a => a.present).length === 0 ? (
                        <p className="text-slate-500 text-sm">No events attended.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {allAttendance.filter(a => a.present).map(a => {
                                const evt = allEvents.find(e => e.event_id === a.event_id)
                                if (!evt) return null;
                                return (
                                    <div key={`${a.member_id}_${a.event_id}`} className="p-3 border rounded-lg bg-slate-50 border-slate-200 dark:bg-slate-800/30 dark:border-slate-800 flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{evt.title}</p>
                                            <p className="text-xs text-slate-500">{evt.event_type} • {new Date(evt.event_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
