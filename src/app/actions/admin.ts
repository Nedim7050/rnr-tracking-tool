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

export async function unfreezeMember(member_id: string) {
    try {
        const res = await submitActionToSheet("unfreeze_member", { member_id })
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addOCPerformance(payload: any) {
    try {
        const res = await submitActionToSheet("add_oc_score", payload)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addBDTargetFulfillment(payload: any) {
    try {
        const res = await submitActionToSheet("add_bd_target", {
            ...payload,
            metric_name: '% Target List Fulfillment',
        })
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updateMetricPoints(metric_id: string, old_base_points: number, new_base_points: number) {
    try {
        const res = await submitActionToSheet("update_metric_with_history", {
            metric_id,
            old_base_points,
            new_base_points
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

export async function updateGlobalSettings(min_voting_score: number) {
    try {
        const res = await submitActionToSheet("update_global_settings", { min_voting_score })
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
