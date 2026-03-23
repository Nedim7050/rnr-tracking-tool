import { getDashboardData } from '@/lib/api'
import { calculateScores } from '@/lib/scoring'
import { MemberProfile } from '@/components/members/member-profile'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params

    const data = await getDashboardData()
    if (!data || !data.members) return notFound()

    const member = data.members.find(m => m.member_id === resolvedParams.id)
    if (!member) return notFound()

    const scores = calculateScores(data)
    const score = scores.find(s => s.member.member_id === member.member_id)
    if (!score) return notFound()

    const submissions = data.submissions.filter(s => s.member_id === member.member_id).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    const attendance = data.attendance.filter(a => a.member_id === member.member_id)
    const events = data.events

    return (
        <div className="max-w-6xl mx-auto">
            <MemberProfile score={score} submissions={submissions} allAttendance={attendance} allEvents={events} />
        </div>
    )
}
