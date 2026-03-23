'use server'
import { submitActionToSheet } from '@/lib/api'

export async function createEvent(payload: any) {
    try {
        const res = await submitActionToSheet("create_event", payload)
        return { success: true, event: res.inserted }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function markAttendance(payloadArray: any[]) {
    try {
        const res = await submitActionToSheet("mark_attendance", payloadArray)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
