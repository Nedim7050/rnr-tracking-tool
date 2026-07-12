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
    eligibilityChecks?: {
        attendancePassed: boolean;
        affiliationPassed: boolean;
        conferencePassed: boolean;
        noRecentBlame: boolean;
        noProbation: boolean;
        notFrozen: boolean;
    };
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

    const minVotingScore = 0;
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

        let latestWarningEndOfDay = 0;
        mSanctions.forEach(s => {
            if ((s.sanction_type || '').toLowerCase().includes('warning')) {
                const dDate = s.event_date ? new Date(s.event_date) : new Date(0);
                if (!isNaN(dDate.getTime())) {
                    dDate.setHours(23, 59, 59, 999);
                    const d = dDate.getTime();
                    if (d > latestWarningEndOfDay) latestWarningEndOfDay = d;
                }
            }
        });

        let latestFreezeStartOfDay = Infinity;
        if (member.frozen) {
            let maxFreeze = 0;
            mSanctions.forEach(s => {
                const type = (s.sanction_type || '').toLowerCase();
                if (type.includes('blame') || type.includes('probation')) {
                    const dDate = s.event_date ? new Date(s.event_date) : new Date(0);
                    if (!isNaN(dDate.getTime())) {
                        dDate.setHours(0, 0, 0, 0);
                        const d = dDate.getTime();
                        if (d > maxFreeze) maxFreeze = d;
                    }
                }
            });
            latestFreezeStartOfDay = maxFreeze > 0 ? maxFreeze : Date.now();
        }

        const isValidDate = (dateString: string | null | undefined): boolean => {
            if (!dateString) return true;
            const dDate = new Date(dateString);
            const d = dDate.getTime();
            if (isNaN(d)) return true;
            
            if (latestWarningEndOfDay > 0 && d <= latestWarningEndOfDay) return false;
            if (member.frozen && d > latestFreezeStartOfDay) return false;
            return true;
        }

        let votingRawScore = 0;
        let generalJDScore = 0;
        let leadershipJDScore = 0;
        let departmentJDScore = 0;
        
        let vpNoteScore = 0;
        mVPNotes.forEach(n => {
            if (isValidDate(n.entered_at)) vpNoteScore += (Number(n.vp_note) || 0);
        });

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

        // 1. Process Attendance & Mandatory Requirement (Check 1)
        let mandatoryTotal = 0;
        let mandatoryPresent = 0;

        scopedEvents.forEach(event => {
            if (!isValidDate(event.event_date)) return;
            const attended = mAttendance.some(a => a.event_id === event.event_id);

            if (['LCM', 'GA', 'Working Hours'].includes(event.event_type)) {
                mandatoryTotal++;
                if (attended) mandatoryPresent++;
            }

            if (event.event_type === 'LCM') {
                // historically LCM instances didn't give points per event, only via the rate threshold
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

        // Rules Setup
        const passedAttendance = mandatoryTotal > 0 ? (mandatoryPresent / mandatoryTotal) >= 0.70 : true;

        if (mandatoryTotal > 0) {
            const mRate = mandatoryPresent / mandatoryTotal;
            if (mRate >= 0.7) {
                votingRawScore += 5;
                breakdown.attendanceDetails.push({ name: 'Mandatory Threshold (>70%) Met', points: 5, type: 'LCM/GA/WH' });
            } else {
                breakdown.attendanceDetails.push({ name: `Mandatory Not Met (${Math.round(mRate * 100)}%)`, points: 0, type: 'LCM/GA/WH' });
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
            if (!isValidDate(sub.event_date || sub.submitted_at)) return;

            // Primary lookup by ID, fallback to name match if IDs got desynchronized (e.g. after a reseed)
            let metric = metrics.find(m => m.metric_id === sub.metric_id);
            if (!metric && sub.metric_name) {
                metric = metrics.find(m => m.metric_name.toLowerCase() === sub.metric_name.toLowerCase());
            }
            if (!metric) return;

            let pts = 0;
            // manual_score must be explicitly set and non-zero to override formula.
            // Google Sheets returns "" as 0 via type coercion, so we must guard against that.
            const hasManualScore = sub.manual_score !== null && sub.manual_score !== undefined 
                && sub.manual_score !== '' && sub.manual_score !== 0 && Number(sub.manual_score) !== 0;
            
            if (hasManualScore) {
                pts = Number(sub.manual_score);
            } else if (metric.formula_type === 'FIXED') {
                pts = metric.base_points;
            } else if (metric.formula_type === 'PER_UNIT') {
                pts = metric.base_points * (sub.quantity || 1);
            } else if (metric.formula_type === 'PERCENT_DIV_10') {
                pts = (sub.percent_value || 0) / 10;
            } else if (metric.formula_type === 'MANUAL_SCORE') {
                pts = Number(sub.manual_score) || 0;
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
            if (!isValidDate(oc.submitted_at)) return;
            const pts = Number(oc.manual_score) || 0;
            generalJDScore += pts;
            breakdown.generalDetails.push({ name: `OC Score`, points: pts, type: 'GENERAL' });
        });

        // 2.2 Process Dedicated BD Targets
        mBDTargets.forEach(bd => {
            if (!isValidDate(bd.submitted_at)) return;
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
            if (!isValidDate(sanction.event_date)) return;
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

        // New Eligibility 5-Step Logic
        const passedAffiliation = mSubmissions.some(sub => sub.metric_name.toLowerCase().includes('affiliation'));
        
        const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
        const passedConference = mAttendance.some(a => {
            const ev = scopedEvents.find(e => e.event_id === a.event_id);
            if (!ev || ev.event_type !== 'Conference') return false;
            const d = ev.event_date ? new Date(ev.event_date).getTime() : 0;
            return d >= sixMonthsAgo;
        });

        const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const passedBlameCheck = !mSanctions.some(s => {
            if (!(s.sanction_type || '').toLowerCase().includes('blame')) return false;
            const d = s.event_date ? new Date(s.event_date).getTime() : 0;
            return d >= threeMonthsAgo;
        });

        const passedProbationCheck = !mSanctions.some(s => (s.sanction_type || '').toLowerCase().includes('probation'));

        const isEligible5Step = passedAttendance && passedAffiliation && passedConference && passedBlameCheck && passedProbationCheck && !member.frozen;

        list.push({
            member,
            trackingScore,
            votingRawScore,
            isEligibleForVoting: isEligible5Step,
            eligibilityChecks: {
                attendancePassed: passedAttendance,
                affiliationPassed: passedAffiliation,
                conferencePassed: passedConference,
                noRecentBlame: passedBlameCheck,
                noProbation: passedProbationCheck,
                notFrozen: !member.frozen
            },
            breakdown
        });
    }

    // Sort by tracking score descending by default
    return list.sort((a, b) => b.trackingScore - a.trackingScore);
}
