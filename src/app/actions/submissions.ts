'use server'
import { getDashboardData, submitActionToSheet } from '@/lib/api'

export async function submitMemberAction(formData: any) {
    // 1. Verify Member Code
    const data = await getDashboardData().catch(() => null)
    if (!data) return { success: false, error: "Database offline" }

    const member = data.members.find(m => m.member_id === formData.member_id)
    if (!member) return { success: false, error: "Member not found" }

    // Google Sheets may parse numeric member codes as Numbers, while the form sends a String
    if (String(member.member_code).trim() !== String(formData.member_code).trim()) {
        return { success: false, error: "Invalid Member Code. Please check your spelling." }
    }

    const metric = data.metrics.find(m => m.metric_id === formData.metric_id)
    if (!metric) return { success: false, error: "Invalid Metric selected." }

    // 2. Prepare payload
    const submissionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const payload = {
        submission_id: submissionId,
        submitted_at: new Date().toISOString(),
        member_id: member.member_id,
        member_name: member.full_name,
        department_code: member.department_code,
        position_code: member.position_code,
        metric_id: metric.metric_id,
        metric_name: metric.metric_name,
        subtype: formData.subtype || "",
        quantity: formData.quantity || 1,
        percent_value: formData.percent_value || "",
        manual_score: "",
        proof_url: formData.proof_url || "",
        proof_type: formData.proof_type || "Link",
        event_date: formData.event_date || new Date().toISOString().split('T')[0],
        period_key: 'active', // Should theoretically read current voting period
        status: 'pending',
        reviewed_by: "",
        review_note: "",
        reviewed_at: ""
    }

    // 3. Post to GAS
    try {
        const res = await submitActionToSheet("submit_action", payload)
        return { success: true, submissionId }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function adminReviewSubmission(submissionId: string, status: 'approved' | 'rejected' | 'flagged_duplicate', reviewNote: string = "") {
    try {
        const payload = {
            submission_id: submissionId,
            status: status,
            reviewed_by: "Admin",
            review_note: reviewNote,
            reviewed_at: new Date().toISOString()
        }
        const res = await submitActionToSheet("review_submission", payload)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
