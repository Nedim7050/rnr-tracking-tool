import { getDashboardData } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
    const data = await getDashboardData().catch(() => null)

    if (!data) return <div className="p-12 text-center text-slate-500">Database connection required.</div>

    const logs = [...(data.audit_log || [])].reverse()

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Log</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Review system-wide administrative actions and changes.
                </p>
            </div>

            <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                <CardHeader className="border-b border-blue-100 dark:border-slate-800 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Action History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/30">
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log, i) => (
                                    <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <TableCell className="text-sm font-medium text-slate-500">
                                            {new Date(log.performed_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-semibold">{log.performed_by}</TableCell>
                                        <TableCell>
                                            <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                                                {log.action_type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                            {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                                        </TableCell>
                                        <TableCell className="text-sm">{log.details}</TableCell>
                                    </TableRow>
                                ))}
                                {logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            No audit logs found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
