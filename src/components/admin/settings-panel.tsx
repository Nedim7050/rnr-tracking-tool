'use client'
import { useState } from 'react'
import { DashboardData } from '@/types'
import { addVPNote, addSanction, seedGoogleSheets, seedGoogleSheetsMetrics, forceRecalculation, addOCPerformance, addBDTargetFulfillment, updateMetricPoints, updateGlobalSettings, unfreezeMember } from '@/app/actions/admin'
import { SEEDED_MEMBERS } from '@/lib/seed'
import { SEEDED_METRICS } from '@/lib/metrics-seed'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, RefreshCw, DatabaseZap } from 'lucide-react'

export function SettingsPanel({ data }: { data: DashboardData }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const members = data.members || []

    // States
    const [memberId, setMemberId] = useState('')
    const [vpNote, setVpNote] = useState('')
    const [vpComment, setVpComment] = useState('')

    const [sMemberId, setSMemberId] = useState('')
    const [sType, setSType] = useState('')
    const [sDate, setSDate] = useState(new Date().toISOString().split('T')[0])

    const [ocMemberId, setOCMemberId] = useState('')
    const [ocScore, setOCScore] = useState('')

    const [bdMemberId, setBdMemberId] = useState('')
    const [bdPercent, setBdPercent] = useState('')

    const [metricToUpdate, setMetricToUpdate] = useState('')
    const [newMetricPoints, setNewMetricPoints] = useState('')

    const [globalMinScore, setGlobalMinScore] = useState(data.voting_periods?.[0]?.min_voting_score?.toString() || '0')

    const notify = (msg: string, type: 'success' | 'error') => {
        setMessage({ text: msg, type })
        setTimeout(() => setMessage({ text: '', type: '' }), 5000)
        if (type === 'success') window.location.reload()
    }

    const handleVPNote = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await addVPNote({
            note_id: `VPN_${Date.now()}`,
            member_id: memberId,
            period_key: 'active',
            vp_note: Number(vpNote),
            comment: vpComment,
            entered_by: 'Admin',
            entered_at: new Date().toISOString()
        })
        setLoading(false)
        if (res.success) notify('VP Note added.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleSanction = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Points logic
        let pts = 0;
        if (sType === 'reprimand') pts = -5
        if (sType === 'warning') pts = -10
        if (sType === 'dismissal from OC') pts = -10
        if (sType === 'probation') pts = -15
        if (sType === 'blame') pts = -20
        if (sType === 'being a voting member and not attending AG') pts = -5

        const res = await addSanction({
            sanction_id: `SNC_${Date.now()}`,
            member_id: sMemberId,
            sanction_type: sType,
            points: pts,
            event_date: sDate,
            period_key: 'active',
            comment: ""
        })
        setLoading(false)
        if (res.success) notify('Sanction added.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleOCPerformance = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const ocMetric = data.metrics?.find(m => m.metric_name === 'OC performance')
        if (!ocMetric) {
            notify('OC performance metric not found in database. Seed metrics first.', 'error')
            setLoading(false)
            return;
        }

        const payload = {
            submission_id: `SUB_${Date.now()}`,
            member_id: ocMemberId,
            metric_id: ocMetric.metric_id,
            metric_name: ocMetric.metric_name,
            status: 'approved',
            manual_score: Number(ocScore),
            submitted_at: new Date().toISOString(),
            vp_notes: "Admin Input",
            period_key: 'active'
        }

        const res = await addOCPerformance(payload)
        setLoading(false)
        if (res.success) notify('OC Performance recorded.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleBDFulfillment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const bdMetric = data.metrics?.find(m => m.metric_name.toLowerCase().includes('target') && m.metric_name.toLowerCase().includes('fulfillment'))
        if (!bdMetric) {
            notify('% Target List Fulfillment metric not found. Please seed metrics first.', 'error')
            setLoading(false)
            return;
        }
        const payload = {
            submission_id: `SUB_${Date.now()}`,
            member_id: bdMemberId,
            metric_id: bdMetric.metric_id,
            metric_name: bdMetric.metric_name,
            status: 'approved',
            percent_value: Number(bdPercent),
            submitted_at: new Date().toISOString(),
            period_key: 'active'
        }
        const res = await addBDTargetFulfillment(payload)
        setLoading(false)
        if (res.success) notify('BD Target Fulfillment recorded.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleMetricUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const metric = data.metrics?.find(m => m.metric_id === metricToUpdate)
        if (!metric) return;
        
        const res = await updateMetricPoints(metricToUpdate, metric.base_points, Number(newMetricPoints))
        setLoading(false)
        if (res.success) notify('Metric updated and historical scores correctly frozen.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleGlobalSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await updateGlobalSettings(Number(globalMinScore))
        setLoading(false)
        if (res.success) notify('Global Min Voting Score updated.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleSeed = async () => {
        if (!confirm("This will clear the Members sheet and insert AIESEC Carthage base members. Are you sure?")) return;
        setLoading(true)
        const res = await seedGoogleSheets(SEEDED_MEMBERS.map(m => ({ ...m, member_id: `MEM_${Math.random().toString(36).substr(2, 7).toUpperCase()}`, active: true, member_code: Math.floor(1000 + Math.random() * 9000).toString(), created_at: new Date().toISOString() })))
        setLoading(false)
        if (res.success) notify('Members database seeded.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleSeedMetrics = async () => {
        if (!confirm("This will clear the MetricCatalog sheet and insert AIESEC Carthage tracking metrics. Are you sure?")) return;
        setLoading(true)
        const metricsPayload = SEEDED_METRICS.map(m => ({
            metric_id: `MET_${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
            metric_name: m.metric_name || "",
            category: m.category || "GENERAL",
            formula_type: m.formula_type || "FIXED",
            base_points: m.base_points || 0,
            counts_for_voting: m.counts_for_voting || false,
            requires_proof: m.requires_proof || false,
            proof_label: m.proof_label || "",
            requires_quantity: m.requires_quantity || false,
            department_scope: m.department_scope || "ALL",
            position_scope: m.position_scope || "ALL",
            active: true
        }))
        const res = await seedGoogleSheetsMetrics(metricsPayload)
        setLoading(false)
        if (res.success) notify('Metrics database seeded.', 'success')
        else notify(res.error || 'Error', 'error')
    }

    const handleRecache = async () => {
        setLoading(true)
        await forceRecalculation()
        setLoading(false)
        notify('Frontend cache cleared. Scores recalculated.', 'success')
    }

    return (
        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all h-full min-h-[500px]">
            <CardHeader className="border-b border-blue-100 dark:border-slate-800 pb-0 px-0 pt-6">
                <Tabs defaultValue="vpnotes" className="w-full">
                    <div className="px-6 flex justify-between items-center mb-6">
                        <CardTitle className="text-xl">Admin Controls</CardTitle>
                        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
                            <TabsTrigger value="vpnotes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">VP Notes</TabsTrigger>
                            <TabsTrigger value="sanctions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">Sanctions</TabsTrigger>
                            <TabsTrigger value="frozen" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">Frozen Members</TabsTrigger>
                            <TabsTrigger value="oc_performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">OC Score</TabsTrigger>
                            <TabsTrigger value="bd_fulfillment" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">BD% Target</TabsTrigger>
                            <TabsTrigger value="metric_points" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">Metric Points</TabsTrigger>
                            <TabsTrigger value="advanced" className="data-[state=active]:bg-red-50 text-red-600 dark:data-[state=active]:bg-red-950/30">Advanced</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-6 pb-2">
                        {message.text && (
                            <div className={`p-3 rounded-md text-sm mb-4 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    <TabsContent value="vpnotes" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <form onSubmit={handleVPNote} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Member</label>
                                <Select value={memberId} onValueChange={(v) => v && setMemberId(v)} required>
                                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                                    <SelectContent>
                                        {members.map(m => <SelectItem key={m.member_id} value={m.member_id}>{m.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Points Modifier (+ or -)</label>
                                <Input type="number" placeholder="-5 or 10" value={vpNote} onChange={e => setVpNote(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Reasoning Comment</label>
                                <Input placeholder="Excellent OC performance..." value={vpComment} onChange={e => setVpComment(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="mt-2 bg-blue-600 hover:bg-blue-700 w-full">Save VP Note</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="sanctions" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <form onSubmit={handleSanction} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Member</label>
                                <Select value={sMemberId} onValueChange={(v) => v && setSMemberId(v)} required>
                                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                                    <SelectContent>
                                        {members.map(m => <SelectItem key={m.member_id} value={m.member_id}>{m.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Sanction Type</label>
                                <Select value={sType} onValueChange={(v) => v && setSType(v as any)} required>
                                    <SelectTrigger><SelectValue placeholder="Select sanction" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reprimand">Reprimand (-5 pts)</SelectItem>
                                        <SelectItem value="warning">Warning (-10 pts)</SelectItem>
                                        <SelectItem value="dismissal from OC">Dismissal from OC (-10 pts)</SelectItem>
                                        <SelectItem value="probation">Probation (-15 pts)</SelectItem>
                                        <SelectItem value="blame">Blame (-20 pts)</SelectItem>
                                        <SelectItem value="being a voting member and not attending AG">Voting Member Missing AG (-5 pts)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Date</label>
                                <Input type="date" value={sDate} onChange={e => setSDate(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="mt-2 text-white bg-red-600 hover:bg-red-700 w-full">Apply Sanction</Button>
                        </form>
                    </TabsContent>
                    
                    <TabsContent value="frozen" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <div className="space-y-4 max-w-lg">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Currently Frozen Members</h3>
                            <p className="text-xs text-slate-500 mb-4">Members who received a Blame or Probation are listed here. While frozen, their points are halted.</p>
                            {data.members.filter(m => m.frozen).length === 0 ? (
                                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-sm font-medium text-slate-400">No members are currently frozen.</div>
                            ) : (
                                <div className="space-y-2">
                                    {data.members.filter(m => m.frozen).map(member => (
                                        <div key={member.member_id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
                                            <span className="font-semibold text-red-900 dark:text-red-400 text-sm tracking-wide">{member.full_name}</span>
                                            <Button 
                                                size="sm" 
                                                className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:bg-slate-950 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 shadow-sm transition-all"
                                                variant="outline"
                                                disabled={loading}
                                                onClick={async () => {
                                                    setLoading(true)
                                                    const res = await unfreezeMember(member.member_id)
                                                    setLoading(false)
                                                    if (res.success) notify(`${member.full_name} has been unfrozen. Their scoring is back to normal.`, 'success')
                                                    else notify(res.error || 'Error', 'error')
                                                }}
                                            >
                                                Unfreeze
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="oc_performance" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <form onSubmit={handleOCPerformance} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Member</label>
                                <Select value={ocMemberId} onValueChange={(v) => v && setOCMemberId(v)} required>
                                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                                    <SelectContent>
                                        {members.map(m => <SelectItem key={m.member_id} value={m.member_id}>{m.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Performance Score (1-10)</label>
                                <Input type="number" min="1" max="10" placeholder="e.g. 8" value={ocScore} onChange={e => setOCScore(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full">Save OC Performance</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="bd_fulfillment" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-400">
                            <strong>BD&amp;EwA Department Only:</strong> Enter the % Target List Fulfillment for BD members. Score = percent ÷ 10 (so 80% → 8 pts).
                        </div>
                        <form onSubmit={handleBDFulfillment} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">BD Member</label>
                                <Select value={bdMemberId} onValueChange={(v) => v && setBdMemberId(v)} required>
                                    <SelectTrigger><SelectValue placeholder="Select BD member" /></SelectTrigger>
                                    <SelectContent>
                                        {members.filter(m => (m.department_code || '').toUpperCase().includes('BD')).map(m => <SelectItem key={m.member_id} value={m.member_id}>{m.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Target List Fulfillment %</label>
                                <Input type="number" min="0" max="100" placeholder="e.g. 80" value={bdPercent} onChange={e => setBdPercent(e.target.value)} required />
                                <p className="text-xs text-slate-500">{bdPercent ? `→ Will award ${(Number(bdPercent) / 10).toFixed(1)} points` : 'Points = % ÷ 10'}</p>
                            </div>
                            <Button type="submit" disabled={loading} className="mt-2 bg-amber-600 hover:bg-amber-700 text-white w-full">Save BD% Target Fulfillment</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="metric_points" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <form onSubmit={handleMetricUpdate} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Select Action / Metric</label>
                                <Select value={metricToUpdate} onValueChange={(v) => v && setMetricToUpdate(v)} required>
                                    <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                                    <SelectContent className="min-w-[400px] w-full max-w-sm sm:max-w-md">
                                        {data.metrics?.filter(m => m.formula_type === 'FIXED' || m.formula_type === 'PER_UNIT').map(m => (
                                            <SelectItem key={m.metric_id} value={m.metric_id}>{m.metric_name} ({m.base_points} pts)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">New Base Points</label>
                                <Input type="number" min="0" value={newMetricPoints} onChange={e => setNewMetricPoints(e.target.value)} required />
                            </div>
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-400 mt-2">
                                <strong>Important:</strong> Changing this will automatically freeze the exact scores for all PAST submissions of this metric, meaning no one loses points. Only FUTURE submissions will use the new base points value.
                            </div>
                            <Button type="submit" disabled={loading} className="mt-2 bg-blue-600 hover:bg-blue-700 w-full">Update Metric & Freeze History</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="advanced" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        <div className="space-y-6 max-w-xl">
                            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                                <h4 className="font-bold flex items-center gap-2 text-emerald-900 dark:text-emerald-400 mb-1">Global Settings</h4>
                                <form onSubmit={handleGlobalSettings} className="space-y-4">
                                    <div className="space-y-2 max-w-xs">
                                        <label className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Min. Points for Voting Eligibility</label>
                                        <div className="flex gap-2">
                                            <Input type="number" min="0" value={globalMinScore} onChange={e => setGlobalMinScore(e.target.value)} required className="bg-white dark:bg-slate-950 border-emerald-200 dark:border-emerald-800"/>
                                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
                                <h4 className="font-bold flex items-center gap-2 text-blue-900 dark:text-blue-400 mb-1"><RefreshCw className="h-5 w-5" /> Force Cache Refresh</h4>
                                <p className="text-sm text-blue-700/80 dark:text-blue-300">If scoring or submissions are delayed, manually purge the Next.js cache and recalculate.</p>
                                <Button disabled={loading} onClick={handleRecache} className="mt-4 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-slate-800">Refresh Data</Button>
                            </div>

                            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
                                <h4 className="font-bold flex items-center gap-2 text-red-900 dark:text-red-400 mb-1"><DatabaseZap className="h-5 w-5" /> Seed Databases</h4>
                                <p className="text-sm text-red-700/80 dark:text-red-400 mb-4">Initialize the default Carthage lists.</p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button disabled={loading} onClick={handleSeed} variant="destructive">Seed Members</Button>
                                    <Button disabled={loading} onClick={handleSeedMetrics} variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/50">Seed Metrics</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardHeader>
        </Card>
    )
}
