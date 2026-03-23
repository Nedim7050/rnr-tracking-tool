export type Member = {
  member_id: string;
  full_name: string;
  department_code: string;
  department_label: string;
  position_code: string;
  position_label: string;
  active: boolean;
  member_code: string;
  created_at: string;
  email?: string;
  phone?: string;
  fb_link?: string;
};

export type MetricCatalog = {
  metric_id: string;
  metric_name: string;
  category: string;
  scope: string; // 'GENERAL', 'DEPARTMENT', 'LEADERSHIP', 'VOTING'
  department_scope: string | null; // e.g. 'TM_DEPT'
  position_scope: string | null;   // e.g. 'TL'
  counts_for_tracking: boolean;
  counts_for_voting: boolean;
  formula_type: 'FIXED' | 'PER_UNIT' | 'PERCENT_DIV_10' | 'MANUAL_SCORE' | 'LCM_THRESHOLD';
  base_points: number;
  requires_quantity: boolean;
  requires_proof: boolean;
  proof_label: string | null;
  active: boolean;
};

export type Submission = {
  submission_id: string;
  submitted_at: string;
  member_id: string;
  member_name: string;
  department_code: string;
  position_code: string;
  metric_id: string;
  metric_name: string;
  subtype: string | null; // e.g. 'iGV', 'oGT'
  quantity: number | null;
  percent_value: number | null;
  manual_score: number | null;
  proof_url: string | null;
  proof_type: string | null;
  event_date: string;
  period_key: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged_duplicate';
  reviewed_by: string | null;
  review_note: string | null;
  reviewed_at: string | null;
};

export type Event = {
  event_id: string;
  event_type: 'GA' | 'LCM' | 'Working Hours' | 'LC Event' | 'Conference' | 'Department Touchpoint';
  title: string;
  event_date: string;
  department_scope: string | null;
  period_key: string;
};

export type Attendance = {
  attendance_id: string;
  event_id: string;
  member_id: string;
  present: boolean;
  excused: boolean;
  entered_by: string;
  entered_at: string;
};

export type VPNote = {
  note_id: string;
  member_id: string;
  period_key: string;
  vp_note: number;
  comment: string;
  entered_by: string;
  entered_at: string;
};

export type Sanction = {
  sanction_id: string;
  member_id: string;
  sanction_type: 'reprimand' | 'warning' | 'dismissal from OC' | 'probation' | 'blame' | 'being a voting member and not attending AG';
  points: number;
  event_date: string;
  period_key: string;
  comment: string;
};

export type VotingPeriod = {
  period_key: string;
  label: string;
  start_date: string;
  end_date: string;
  min_voting_score: number;
  active: boolean;
};

export type AuditLog = {
  log_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  performed_at: string;
  details: string;
};

export interface DashboardData {
  members: Member[];
  metrics: MetricCatalog[];
  submissions: Submission[];
  events: Event[];
  attendance: Attendance[];
  vp_notes: VPNote[];
  sanctions: Sanction[];
  voting_periods: VotingPeriod[];
  audit_log: AuditLog[];
}
