/**
 * ProofPixel — API Service Layer
 *
 * Centralized service for communicating with the FastAPI backend.
 * All API calls go through this module to ensure consistent error handling,
 * base URL configuration, and response typing.
 */

/**
 * Base URL for the FastAPI backend.
 * Reads from VITE_API_URL env var (set in Vercel dashboard for production).
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

/**
 * Sends an image file to the backend for deepfake analysis.
 *
 * @param {File} file - The image File object to analyze.
 * @param {string|null} userId - Optional Supabase user ID for scan history.
 * @returns {Promise<{label: string, confidence: number, image_hash: string, processing_time_ms: number, is_ai_generated: boolean}>}
 */
export async function analyzeImage(file, userId = null) {
    const formData = new FormData();
    formData.append("file", file);

    const headers = {};
    if (userId) {
        headers["X-User-Id"] = userId;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData,
            headers,
        });
    } catch (networkError) {
        throw {
            message:
                "Unable to reach the ProofPixel backend at " +
                API_BASE_URL +
                ". The server may be starting up — please try again in 30 seconds.",
        };
    }

    if (!response.ok) {
        let detail = "An unknown server error occurred.";
        try {
            const body = await response.json();
            detail = body.detail ?? body.message ?? detail;
        } catch {
            detail = response.statusText || detail;
        }

        throw {
            message: `Server error (${response.status}): ${detail}`,
            status: response.status,
        };
    }

    const data = await response.json();
    return data;
}

/**
 * Fetches the recent scan history for a given user.
 *
 * @param {string} userId - Supabase user UUID.
 * @param {number} limit - Max number of results (default 10).
 * @returns {Promise<Array<{id: number, image_hash: string, ai_probability: number, verdict: string, processing_time_ms: number, created_at: string}>>}
 */
export async function fetchRecentScans(userId, limit = 10) {
    if (!userId) return [];

    try {
        const response = await fetch(
            `${API_BASE_URL}/scans?user_id=${encodeURIComponent(userId)}&limit=${limit}`
        );
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}
