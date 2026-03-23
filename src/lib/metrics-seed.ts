import { MetricCatalog } from '@/types';

// Converts string labels to valid MetricCatalog objects ready for Google Sheets
export const SEEDED_METRICS: Partial<MetricCatalog>[] = [
    // === VOTING CRITERIA ===
    // Attendance metrics are calculated separate from MetricCatalog (in scoring.ts directly via Events) so we don't need "GA +5" here, 
    // but we add the user submissions ones:
    { metric_name: 'CMS', category: 'VOTING', formula_type: 'FIXED', base_points: 1, counts_for_voting: true, requires_proof: true, active: true },
    { metric_name: 'Affiliation', category: 'VOTING', formula_type: 'FIXED', base_points: 3, counts_for_voting: true, requires_proof: true, active: true },
    { metric_name: 'Class shouts (Voting)', proof_label: 'Picture', category: 'VOTING', formula_type: 'FIXED', base_points: 2, counts_for_voting: true, requires_proof: true, active: true },
    { metric_name: 'Short/Mid term application', category: 'VOTING', formula_type: 'FIXED', base_points: 3, counts_for_voting: true, requires_proof: true, active: true },

    // === GENERAL JD ===
    { metric_name: 'EP Hosting', category: 'GENERAL', formula_type: 'FIXED', base_points: 10, requires_proof: true, active: true },
    { metric_name: 'IXP', category: 'GENERAL', formula_type: 'FIXED', base_points: 10, requires_proof: true, active: true },
    { metric_name: 'Pick ups (Not iCX member)', proof_label: 'Picture with EP', category: 'GENERAL', formula_type: 'FIXED', base_points: 5, requires_proof: true, active: true },
    { metric_name: 'Sharing Posts', proof_label: 'Screenshot', category: 'GENERAL', formula_type: 'PER_UNIT', base_points: 2, requires_proof: true, requires_quantity: true, active: true },
    { metric_name: 'Booths (Not MKT)', proof_label: 'Picture', category: 'GENERAL', formula_type: 'FIXED', base_points: 5, requires_proof: true, active: true },
    { metric_name: 'OC performance', category: 'GENERAL', formula_type: 'MANUAL_SCORE', base_points: 0, requires_proof: false, active: true },

    // === MMB DEPARTMENT ===
    { metric_name: 'o2os (MMB TL only)', category: 'LEADERSHIP', department_scope: 'MMB', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Team meetings (MMB TL only)', category: 'LEADERSHIP', department_scope: 'MMB', formula_type: 'PER_UNIT', base_points: 2, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Team productivity rate (MMB TL only)', category: 'LEADERSHIP', department_scope: 'MMB', formula_type: 'FIXED', base_points: 5, requires_proof: true, active: true },
    { metric_name: 'LECs delivered (MMB)', category: 'DEPARTMENT', department_scope: 'MMB', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },

    // === MKT DEPARTMENT ===
    { metric_name: 'Class shouts (MKT)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'MKT', formula_type: 'PER_UNIT', base_points: 1, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Booths (MKT)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'MKT', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Posts Creation (MKT)', category: 'DEPARTMENT', department_scope: 'MKT', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Post sharing (MKT)', proof_label: 'Screenshot', category: 'DEPARTMENT', department_scope: 'MKT', formula_type: 'PER_UNIT', base_points: 1, requires_quantity: true, requires_proof: true, active: true },

    // === BD & EwA ===
    { metric_name: 'Cold calls (BD&EwA)', proof_label: 'Screenshot', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PER_UNIT', base_points: 2, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Mails (BD&EwA)', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PER_UNIT', base_points: 1, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Meetings (BD&EwA)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Contract Signed (BD&EwA)', proof_label: 'Contract', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PER_UNIT', base_points: 10, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Target list fulfillment % (BD&EwA)', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PERCENT_DIV_10', base_points: 0, requires_proof: true, active: true },
    { metric_name: 'Projects Ran Without OC (BD&EwA)', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PER_UNIT', base_points: 10, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'PR Interventions (BD&EwA)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'BD', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },

    // === TM ===
    { metric_name: 'o2os with other MMB (TM)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'TM', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },

    // === iCX ===
    { metric_name: 'APDs iGV (iCX)', proof_label: 'Setting expectation mail + Invitation letter + Accommodation', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'APDs iGT (iCX)', proof_label: 'Setting expectation mail + Invitation letter + Accommodation', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 7, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Cold calls (iCX)', proof_label: 'Screenshot', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 1, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Meetings (iCX)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Contract Signed (iCX)', proof_label: 'Contract', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Opens (iCX)', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 1, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Pick Ups (iCX)', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'IR Calls (iCX)', proof_label: 'Screenshot', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 2, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Creating Posts (iCX)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Trips (iCX)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 10, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'IPS (iCX)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'First Day of work (iCX)', proof_label: 'Picture', category: 'DEPARTMENT', department_scope: 'iCX', formula_type: 'FIXED', base_points: 5, requires_proof: true, active: true },

    // === oGX ===
    { metric_name: 'APD oGV (oGX)', proof_label: 'Contract & Payement proof & APD Mail', category: 'DEPARTMENT', department_scope: 'oGX', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'APD oGT (oGX)', proof_label: 'Contract & Payement proof & APD Mail', category: 'DEPARTMENT', department_scope: 'oGX', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'IR Calls (oGX)', proof_label: 'Screenshot', category: 'DEPARTMENT', department_scope: 'oGX', formula_type: 'PER_UNIT', base_points: 2, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'OPS (oGX)', proof_label: 'Invitation + delivery Picture', category: 'DEPARTMENT', department_scope: 'oGX', formula_type: 'PER_UNIT', base_points: 2, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'EP Follow-up (oGX)', category: 'DEPARTMENT', department_scope: 'oGX', formula_type: 'PER_UNIT', base_points: 3, requires_quantity: true, requires_proof: true, active: true },
    { metric_name: 'Debrief (oGX)', proof_label: 'Picture / Screenshot', category: 'DEPARTMENT', department_scope: 'oGX', formula_type: 'PER_UNIT', base_points: 5, requires_quantity: true, requires_proof: true, active: true }
]
