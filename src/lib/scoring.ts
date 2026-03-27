import { DashboardData, Member, Submission, Event, Attendance, VPNote, Sanction, VotingPeriod, MetricCatalog } from '@/types';

export interface ScoreBreakdownItem {
    name: string;
    points: number;
    type?: string;
}

export interface MemberScore {
    member: Member;
    trackingScore: number;
    votingRawScore: number;
    isEligibleForVoting: boolean;
    breakdown: {
        votingDetails: ScoreBreakdownItem[];
        generalDetails: ScoreBreakdownItem[];
        leadershipDetails: ScoreBreakdownItem[];
        departmentDetails: ScoreBreakdownItem[];
        attendanceDetails: ScoreBreakdownItem[];
        sanctionsDetails: ScoreBreakdownItem[];
        vpNote: number;
        totals: {
            voting: number;
            general: number;
            leadership: number;
            department: number;
        }
    };
}

export function calculateScores(data: DashboardData, activePeriodKey: string | null = null): MemberScore[] {
    const { members, metrics, submissions, events, attendance, vp_notes, sanctions, voting_periods } = data;

    const minVotingScore = voting_periods.length > 0 ? Number(voting_periods[0].min_voting_score) || 0 : 0; 
    const scopedEvents = events; 
    const list: MemberScore[] = [];

    for (const member of members) {
        if (!member.active && member.member_id !== 'seeded') {
            // Depending on rules, we might want to see inactive members. Let's include them but marked active: false.
        }

        const mSubmissions = submissions.filter(s => s.member_id === member.member_id && s.status === 'approved');
        const mAttendance = attendance.filter(a => a.member_id === member.member_id && a.present);
        const mSanctions = sanctions.filter(s => s.member_id === member.member_id);
        const mVPNotes = vp_notes.filter(n => n.member_id === member.member_id);
        const mOCScores = (data.oc_scores || []).filter(s => s.member_id === member.member_id);
        const mBDTargets = (data.bd_targets || []).filter(s => s.member_id === member.member_id);

        let votingRawScore = 0;
        let generalJDScore = 0;
        let leadershipJDScore = 0;
        let departmentJDScore = 0;
        let vpNoteScore = mVPNotes.reduce((sum, n) => sum + (Number(n.vp_note) || 0), 0);

        const breakdown = {
            votingDetails: [] as ScoreBreakdownItem[],
            generalDetails: [] as ScoreBreakdownItem[],
            leadershipDetails: [] as ScoreBreakdownItem[],
            departmentDetails: [] as ScoreBreakdownItem[],
            attendanceDetails: [] as ScoreBreakdownItem[],
            sanctionsDetails: [] as ScoreBreakdownItem[],
            vpNote: vpNoteScore,
            totals: { voting: 0, general: 0, leadership: 0, department: 0 }
        };

        // 1. Process Attendance (Counts towards Voting)
        let lcmPresent = 0;
        let lcmTotal = 0;

        scopedEvents.forEach(event => {
            const attended = mAttendance.some(a => a.event_id === event.event_id);

            if (event.event_type === 'LCM') {
                lcmTotal++;
                if (attended) lcmPresent++;
            } else if (attended) {
                let pts = 0;
                if (event.event_type === 'GA') pts = 5;
                if (event.event_type === 'Working Hours') pts = 3;
                if (event.event_type === 'LC Event') pts = 3;
                if (event.event_type === 'Conference') pts = 10;
                if (event.event_type === 'Department Touchpoint') pts = 5;

                if (pts > 0) {
                    votingRawScore += pts;
                    breakdown.attendanceDetails.push({ name: `Attended: ${event.title}`, points: pts, type: event.event_type });
                }
            }
        });

        // LCM rule setup
        if (lcmTotal > 0) {
            const lcmRate = lcmPresent / lcmTotal;
            if (lcmRate >= 0.7) {
                votingRawScore += 5;
                breakdown.attendanceDetails.push({ name: 'LCM Threshold (>70%) Met', points: 5, type: 'LCM' });
            } else {
                breakdown.attendanceDetails.push({ name: `LCM Not Met (${Math.round(lcmRate * 100)}%)`, points: 0, type: 'LCM' });
            }
        }

        // Metrics excluded from voting score — they count as GENERAL JD instead.
        // These metrics have category='VOTING' in the sheet but should NOT count for voting;
        // they contribute to the General JD bucket and hence still affect trackingScore.
        const VOTING_EXCLUDED_METRICS = ['cms', 'class shout', 'class_shout', 'short/mid term', 'short mid term', 'short term application', 'mid term application'];
        const isVotingExcluded = (metricName: string) =>
            VOTING_EXCLUDED_METRICS.some(keyword => metricName.toLowerCase().includes(keyword));

        // 2. Process Submissions
        mSubmissions.forEach(sub => {
            const metric = metrics.find(m => m.metric_id === sub.metric_id);
            if (!metric) return;

            let pts = 0;
            if (sub.manual_score !== null && sub.manual_score !== undefined) {
                pts = Number(sub.manual_score);
            } else if (metric.formula_type === 'FIXED') {
                pts = metric.base_points;
            } else if (metric.formula_type === 'PER_UNIT') {
                pts = metric.base_points * (sub.quantity || 1);
            } else if (metric.formula_type === 'PERCENT_DIV_10') {
                pts = (sub.percent_value || 0) / 10;
            } else if (metric.formula_type === 'MANUAL_SCORE') {
                pts = sub.manual_score || 0;
            }

            const excluded = isVotingExcluded(sub.metric_name);
            const item: ScoreBreakdownItem = { name: sub.metric_name + (sub.quantity && sub.quantity > 1 ? ` (x${sub.quantity})` : ''), points: pts, type: excluded ? 'GENERAL' : metric.category };

            if (excluded) {
                // Voting-excluded metrics → treat as General JD (not voting criteria)
                generalJDScore += pts;
                breakdown.generalDetails.push(item);
            } else if (metric.counts_for_voting) {
                // Normal voting metric → goes into voting raw score
                votingRawScore += pts;
                breakdown.votingDetails.push(item);
            } else if (metric.category === 'GENERAL') {
                generalJDScore += pts;
                breakdown.generalDetails.push(item);
            } else if (metric.category === 'LEADERSHIP') {
                leadershipJDScore += pts;
                breakdown.leadershipDetails.push(item);
            } else if (metric.category === 'DEPARTMENT') {
                departmentJDScore += pts;
                breakdown.departmentDetails.push(item);
            } else {
                // Fallback: any unrecognized category → general JD
                generalJDScore += pts;
                breakdown.generalDetails.push(item);
            }
        });

        // 2.1 Process Dedicated OC Scores
        mOCScores.forEach(oc => {
            const pts = Number(oc.manual_score) || 0;
            generalJDScore += pts;
            breakdown.generalDetails.push({ name: `OC Score`, points: pts, type: 'GENERAL' });
        });

        // 2.2 Process Dedicated BD Targets
        mBDTargets.forEach(bd => {
            const percent = Number(bd.percent_value) || 0;
            const pts = percent / 10;
            departmentJDScore += pts;
            breakdown.departmentDetails.push({ name: `Target Fulfillment`, points: pts, type: 'DEPARTMENT' });
        });

        // 3. Process Sanctions
        // Check for disqualifying sanctions (blame or probation = ineligible for voting list)
        const DISQUALIFYING_SANCTIONS = ['blame', 'probation', 'blam'];
        const hasDisqualifyingSanction = mSanctions.some(s =>
            DISQUALIFYING_SANCTIONS.some(d => (s.sanction_type || '').toLowerCase().includes(d))
        );

        mSanctions.forEach(sanction => {
            const sanctionPts = Number(sanction.points) || 0;
            votingRawScore += sanctionPts; // Sanctions natively carry negative points
            breakdown.sanctionsDetails.push({ name: `Sanction: ${sanction.sanction_type}`, points: sanctionPts });
        });

        // 4. Compile totals
        breakdown.totals.voting = votingRawScore;
        breakdown.totals.general = generalJDScore;
        breakdown.totals.leadership = leadershipJDScore;
        breakdown.totals.department = departmentJDScore;

        // Final Tracking Score Math
        // User requested STRICT formula: Voting Criteria*3 + General JD + (TL*2) + Department JD*2 + VP Note
        votingRawScore = Number(votingRawScore) || 0;
        generalJDScore = Number(generalJDScore) || 0;
        leadershipJDScore = Number(leadershipJDScore) || 0;
        departmentJDScore = Number(departmentJDScore) || 0;
        vpNoteScore = Number(vpNoteScore) || 0;

        let trackingScore = (votingRawScore * 3) + generalJDScore + (leadershipJDScore * 2) + (departmentJDScore * 2) + vpNoteScore;

        list.push({
            member,
            trackingScore,
            votingRawScore,
            isEligibleForVoting: !hasDisqualifyingSanction && votingRawScore >= minVotingScore,
            breakdown
        });
    }

    // Sort by tracking score descending by default
    return list.sort((a, b) => b.trackingScore - a.trackingScore);
}
