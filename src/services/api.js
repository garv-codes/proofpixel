/**
 * ProofPixel — API Service Layer
 *
 * Centralized service for communicating with the FastAPI backend.
 * All API calls go through this module to ensure consistent error handling,
 * base URL configuration, and response typing.
 */

/**
 * Base URL for the FastAPI backend.
 *
 * Reads from the VITE_API_URL environment variable so the same codebase
 * works in both local development (http://localhost:8000/api/v1) and
 * production (e.g. https://proofpixel-api.onrender.com/api/v1).
 *
 * Set VITE_API_URL in Vercel's Environment Variables settings.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

/**
 * Sends an image file to the backend for deepfake analysis.
 *
 * @param {File} file - The image File object to analyze (.jpg, .jpeg, or .png).
 * @returns {Promise<{label: string, confidence: number, image_hash: string, processing_time_ms: number, is_ai_generated: boolean}>}
 * @throws {{ message: string, status?: number }} When the network request fails or the server returns a non-2xx status code.
 */
export async function analyzeImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    let response;

    try {
        response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData,
        });
    } catch (networkError) {
        throw {
            message:
                "Unable to reach the ProofPixel backend. " +
                "Please ensure the FastAPI server is running on http://localhost:8000.",
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
