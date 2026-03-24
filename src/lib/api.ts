import { DashboardData } from '@/types';

export const SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "";

/**
 * Fetches all necessary state from Google Sheets in one go.
 * This is cached on the server for speed and revalidated when needed.
 */
export async function getDashboardData(): Promise<DashboardData> {
    if (!SCRIPT_URL) {
        console.warn("GOOGLE_APPS_SCRIPT_URL is not defined in environment.");
        return {
            members: [], metrics: [], submissions: [], events: [],
            attendance: [], vp_notes: [], sanctions: [], voting_periods: [],
            audit_log: []
        };
    }

    try {
        const res = await fetch(SCRIPT_URL, {
            cache: 'no-store' // We bypass cache for real-time tracking dashboard, or we can use next: { revalidate: 60 }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            throw new Error(`Failed to fetch dashboard data (Status: ${res.status})`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}

/**
 * Submits an action dynamically to the GAS backend POST handler.
 */
export async function submitActionToSheet(action: string, payload: any) {
    if (!SCRIPT_URL) throw new Error("Missing GOOGLE_APPS_SCRIPT_URL");

    try {
        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action, payload }),
            headers: {
                "Content-Type": "text/plain;charset=utf-8", // text/plain to avoid preflight issues in GAS
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to POST to sheet. Action: ${action}`);
        }

        const json = await res.json();
        if (json.error) {
            throw new Error(`API Error: ${json.error}`);
        }
        return json;
    } catch (error) {
        console.error("API POST Error:", error);
        throw error;
    }
}
