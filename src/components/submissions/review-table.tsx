'use client'
import { useState } from 'react'
import { Submission } from '@/types'
import { adminReviewSubmission } from '@/app/actions/submissions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink, Filter } from 'lucide-react'

export function ReviewTable({ submissions }: { submissions: Submission[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')

    const filtered = submissions.filter(s => {
        if (filter === 'pending') return s.status === 'pending'
        if (filter === 'reviewed') return s.status !== 'pending'
        return true
    })

    const handleReview = async (id: string, status: 'approved' | 'rejected' | 'flagged_duplicate') => {
        setLoadingId(id)
        await adminReviewSubmission(id, status, "")
        // In a real app we would use useRouter().refresh() or optimistic updates. We will force a refresh here.
        window.location.reload()
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

    return (
        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-0">
                <div className="p-4 border-b border-blue-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>Pending</button>
                        <button onClick={() => setFilter('reviewed')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'reviewed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>Reviewed</button>
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>All</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/30">
                            <TableRow>
                                <TableHead>Date / Member</TableHead>
                                <TableHead>Metric Details</TableHead>
                                <TableHead>Proof</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((sub) => (
                                <TableRow key={sub.submission_id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${sub.status === 'pending' ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{sub.member_name}</span>
                                            <span className="text-xs text-slate-500 mt-1">{new Date(sub.submitted_at || sub.event_date).toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{sub.metric_name}</span>
                                            <div className="flex gap-2 mt-1">
                                                {sub.subtype && <span className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 px-2 py-0.5 rounded">{sub.subtype}</span>}
                                                {sub.quantity && sub.quantity > 1 && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 px-2 py-0.5 rounded">Qty: {sub.quantity}</span>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {sub.proof_url ? (
                                            <a href={sub.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                                View <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">No proof attached</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize flex inline-flex items-center gap-1.5 w-fit ${getStatusColor(sub.status)} shadow-sm`}>
                                            {getStatusIcon(sub.status)}
                                            <span>{sub.status.replace('_', ' ')}</span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {sub.status === 'pending' ? (
                                            <div className="flex justify-end gap-2 outline-none">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400"
                                                    onClick={() => handleReview(sub.submission_id, 'approved')}
                                                    disabled={loadingId === sub.submission_id}
                                                >
                                                    {loadingId === sub.submission_id ? 'Wait...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
                                                    onClick={() => handleReview(sub.submission_id, 'rejected')}
                                                    disabled={loadingId === sub.submission_id}
                                                >
                                                    {loadingId === sub.submission_id ? 'Wait...' : 'Reject'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Reviewed</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Filter className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                            <p>No {filter !== 'all' ? filter : ''} submissions found.</p>
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
