'use client'
import { useState, useEffect } from 'react'
import { Member, Event, VotingPeriod } from '@/types'
import { createEvent, markAttendance } from '@/app/actions/attendance'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, Users, CheckCircle2, ChevronRight, Save } from 'lucide-react'

export function AttendanceTracker({ members, events, attendance, activePeriod }: { members: Member[], events: Event[], attendance: any[], activePeriod?: VotingPeriod }) {
    const [activeTab, setActiveTab] = useState('create')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Event Creation State
    const [title, setTitle] = useState('')
    const [eventType, setEventType] = useState('')
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0])

    // Checking State
    const [selectedEventId, setSelectedEventId] = useState('')
    const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({})

    // Pre-fill attendance if event already has logs
    useEffect(() => {
        if (!selectedEventId) return;
        const previousRecords = attendance.filter(a => a.event_id === selectedEventId);
        if (previousRecords.length === 0) {
            setAttendanceMap({}) // reset
            return;
        }
        const newMap: Record<string, boolean> = {};
        previousRecords.forEach(a => {
            if (a.present) newMap[a.member_id] = true;
        })
        setAttendanceMap(newMap)
    }, [selectedEventId, attendance])

    // Handlers
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const eventId = `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`

        const res = await createEvent({
            event_id: eventId,
            event_type: eventType,
            title: title,
            event_date: eventDate,
            department_scope: 'ALL',
            period_key: activePeriod?.period_key || 'default'
        })

        if (res.success) {
            setSelectedEventId(eventId)
            setActiveTab('mark')
            // Reset form
            setTitle(''); setEventType('')
        } else {
            setError(res.error || 'Failed to create event')
        }
        setLoading(false)
    }

    const handleSaveAttendance = async () => {
        setLoading(true)
        setError('')

        const payloadArray = members.map(m => ({
            attendance_id: `ATT_${selectedEventId}_${m.member_id}`,
            event_id: selectedEventId,
            member_id: m.member_id,
            present: !!attendanceMap[m.member_id],
            excused: false,
            entered_by: 'Admin',
            entered_at: new Date().toISOString()
        }))

        const res = await markAttendance(payloadArray)
        if (res.success) {
            alert("Attendance Saved Successfully!")
            window.location.reload()
        } else {
            setError(res.error || 'Failed to save attendance')
        }
        setLoading(false)
    }

    const toggleAll = (state: boolean) => {
        const newMap = { ...attendanceMap }
        members.forEach(m => newMap[m.member_id] = state)
        setAttendanceMap(newMap)
    }

    // To display the newly created event in the Select if it hasn't reloaded yet
    const displayEvents = [...events];
    if (selectedEventId && !events.find(e => e.event_id === selectedEventId)) {
        displayEvents.push({
            event_id: selectedEventId,
            title: "Just Created...",
            event_type: "...",
            event_date: eventDate,
            department_scope: "",
            period_key: ""
        } as any)
    }

    return (
        <Card className="border-blue-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 shadow-sm transition-all h-full min-h-[500px]">
            <CardHeader className="border-b border-blue-100 dark:border-slate-800 pb-0 px-0 pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 flex justify-between items-center mb-6">
                        <CardTitle className="text-xl">Event & Attendance</CardTitle>
                        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
                            <TabsTrigger value="create" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm">1. Create Event</TabsTrigger>
                            <TabsTrigger value="mark" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm" disabled={!selectedEventId && events.length === 0}>2. Mark Attendance</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB 1: CREATE */}
                    <TabsContent value="create" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        {error && <div className="bg-red-50 text-red-600 outline-none p-3 mb-4 rounded-md text-sm border border-red-200">{error}</div>}
                        <form onSubmit={handleCreateEvent} className="space-y-5 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Title</label>
                                <Input placeholder="e.g. November General Assembly" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Type</label>
                                <Select value={eventType} onValueChange={setEventType} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[300px]">
                                        <SelectItem value="GA">General Assembly (GA)</SelectItem>
                                        <SelectItem value="LCM">Local Committee Meeting (LCM)</SelectItem>
                                        <SelectItem value="Working Hours">Working Hours</SelectItem>
                                        <SelectItem value="LC Event">LC Event</SelectItem>
                                        <SelectItem value="Conference">Conference</SelectItem>
                                        <SelectItem value="Department Touchpoint">Department Touchpoint</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date</label>
                                <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700 group">
                                {loading ? 'Creating...' : 'Create Event'}
                                {!loading && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* TAB 2: MARK */}
                    <TabsContent value="mark" className="px-6 pb-6 pt-2 m-0 border-none outline-none">
                        {error && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-md text-sm border border-red-200">{error}</div>}

                        <div className="flex flex-col sm:flex-row gap-4 mb-6 pt-2 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Event to mark</label>
                                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                    <SelectTrigger className="border-blue-200 focus:ring-blue-500 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900 border-2 transition-colors w-full break-all whitespace-normal h-auto min-h-[2.5rem] py-2">
                                        <SelectValue placeholder="Choose an event..." />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[300px]">
                                        {displayEvents.map(e => (
                                            <SelectItem key={e.event_id} value={e.event_id}>
                                                {e.title} ({new Date(e.event_date).toLocaleDateString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedEventId && (
                                <Button onClick={handleSaveAttendance} disabled={loading} className="w-full sm:w-auto mt-4 sm:mt-0 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Attendance'}
                                </Button>
                            )}
                        </div>

                        {selectedEventId ? (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                                <div className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 p-3 flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Members List</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="h-8 text-xs">Mark All Present</Button>
                                        <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="h-8 text-xs">Clear All</Button>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                                    {members.map(m => (
                                        <div key={m.member_id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <Checkbox
                                                id={`att-${m.member_id}`}
                                                checked={!!attendanceMap[m.member_id]}
                                                onCheckedChange={(checked) => {
                                                    setAttendanceMap(prev => ({ ...prev, [m.member_id]: !!checked }))
                                                }}
                                                className="h-5 w-5 rounded data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white border-slate-300 dark:border-slate-700"
                                            />
                                            <label htmlFor={`att-${m.member_id}`} className="ml-3 flex-1 cursor-pointer flex justify-between items-center">
                                                <span className="font-medium text-slate-900 dark:text-slate-100">{m.full_name}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{m.department_label} • {m.position_label}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                                <CalendarDays className="h-10 w-10 mb-2 opacity-50" />
                                <p>Please select or create an event first.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardHeader>
        </Card>
    )
}
