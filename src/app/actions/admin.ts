'use server'
import { submitActionToSheet } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function addVPNote(payload: any) {
    try {
        const res = await submitActionToSheet("add_vp_note", payload)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addSanction(payload: any) {
    try {
        const res = await submitActionToSheet("add_sanction", payload)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addOCPerformance(payload: any) {
    try {
        const res = await submitActionToSheet("submit_action", payload)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addBDTargetFulfillment(payload: any) {
    try {
        // payload: { member_id, metric_id, percent_value, period_key, entered_by }
        const res = await submitActionToSheet("submit_action", {
            ...payload,
            metric_name: '% Target List Fulfillment',
            status: 'approved', // Admin sets it directly, no review needed
        })
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function createVotingPeriod(payload: any) {
    try {
        const res = await submitActionToSheet("create_voting_period", payload)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function seedGoogleSheets(membersData: any[]) {
    try {
        if (membersData.length === 0) return { success: false, error: 'No data' }
        const headers = Object.keys(membersData[0])
        const rows = membersData.map(m => headers.map(h => m[h]))
        await submitActionToSheet("seed_members", { headers, rows })
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function seedGoogleSheetsMetrics(metricsData: any[]) {
    try {
        if (metricsData.length === 0) return { success: false, error: 'No data' }
        const headers = Object.keys(metricsData[0])
        const rows = metricsData.map(m => headers.map(h => m[h]))
        await submitActionToSheet("seed_metrics", { headers, rows })
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function forceRecalculation() {
    revalidatePath('/')
    return { success: true }
}
