/**
 * ProofPixel — Frontend Unit Tests
 *
 * Tests individual components and services in isolation.
 * Uses Vitest + React Testing Library + jsdom.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── API Service Tests ──────────────────────────────────────────────────────

describe("API Service — analyzeImage", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("sends FormData with file and user ID header", async () => {
        const mockResponse = {
            ok: true,
            json: () =>
                Promise.resolve({
                    label: "Fake",
                    confidence: 94.5,
                    is_ai_generated: true,
                    image_hash: "abc123",
                    processing_time_ms: 120,
                    ela_image: "",
                    fft_image: "",
                }),
        };
        vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

        const { analyzeImage } = await import("@/services/api");
        const file = new File(["fake-image-data"], "test.jpg", { type: "image/jpeg" });
        const result = await analyzeImage(file, "user-123");

        expect(fetch).toHaveBeenCalledTimes(1);
        const [url, options] = fetch.mock.calls[0];
        expect(url).toContain("/analyze");
        expect(options.method).toBe("POST");
        expect(options.headers["X-User-Id"]).toBe("user-123");
        expect(options.body).toBeInstanceOf(FormData);
        expect(result.confidence).toBe(94.5);
        expect(result.is_ai_generated).toBe(true);
    });

    it("throws a specific error when the server cannot be reached", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network failure"));

        const { analyzeImage } = await import("@/services/api");
        const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

        await expect(analyzeImage(file)).rejects.toMatchObject({
            message: expect.stringContaining("Unable to reach the ProofPixel backend"),
        });
    });

    it("throws a specific error for non-OK server responses", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            status: 422,
            statusText: "Unprocessable Entity",
            json: () => Promise.resolve({ detail: "Image too small" }),
        });

        const { analyzeImage } = await import("@/services/api");
        const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

        await expect(analyzeImage(file)).rejects.toMatchObject({
            message: expect.stringContaining("Image too small"),
            status: 422,
        });
    });

    it("uses a descriptive fallback when server response body is not JSON", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () => Promise.reject(new Error("not JSON")),
        });

        const { analyzeImage } = await import("@/services/api");
        const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

        await expect(analyzeImage(file)).rejects.toMatchObject({
            message: expect.stringContaining("Internal Server Error"),
        });
    });
});

describe("API Service — fetchRecentScans", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("returns empty array when no userId is provided", async () => {
        const { fetchRecentScans } = await import("@/services/api");
        const result = await fetchRecentScans(null);
        expect(result).toEqual([]);
    });

    it("returns empty array when fetch fails", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
        const { fetchRecentScans } = await import("@/services/api");
        const result = await fetchRecentScans("user-123");
        expect(result).toEqual([]);
    });
});

describe("API Service — clearRecentScans", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("returns false when no userId is provided", async () => {
        const { clearRecentScans } = await import("@/services/api");
        const result = await clearRecentScans(null);
        expect(result).toBe(false);
    });

    it("sends DELETE request with X-User-Id header", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });
        const { clearRecentScans } = await import("@/services/api");
        const result = await clearRecentScans("user-456");

        expect(result).toBe(true);
        const [, options] = fetch.mock.calls[0];
        expect(options.method).toBe("DELETE");
        expect(options.headers["X-User-Id"]).toBe("user-456");
    });
});

// ─── Copy / Content Tests ───────────────────────────────────────────────────

describe("Copy Rewrite Verification", () => {
    it("landing page does not contain generic AI-product language", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/pages/LandingPage.jsx", "utf-8");

        expect(content).not.toContain("state-of-the-art");
        expect(content).not.toContain("AI-powered");
        expect(content).not.toContain("advanced forensic analysis");
        expect(content).not.toContain("Powered by machine learning");
        expect(content).not.toContain("Next-Gen ML Pipeline");
        expect(content).not.toContain("our advanced multi-feature forensic engine");
    });

    it("landing page contains ProofPixel-specific pipeline language", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/pages/LandingPage.jsx", "utf-8");

        expect(content).toContain("ELA");
        expect(content).toContain("FFT");
        expect(content).toContain("HOG");
        expect(content).toContain("Random Forest");
        expect(content).toContain("How It Works");
        expect(content).toContain("What ProofPixel doesn't do well");
    });

    it("upload zone does not contain generic 'our AI' language", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/components/UploadZone.jsx", "utf-8");

        expect(content).not.toContain("our AI will tell you");
        expect(content).toContain("compression artifacts");
    });

    it("error messages are specific, not generic", async () => {
        const fs = await import("fs");
        const apiContent = fs.readFileSync("src/services/api.js", "utf-8");
        const analyzerContent = fs.readFileSync("src/pages/Analyzer.jsx", "utf-8");

        expect(apiContent).not.toContain("An unknown server error occurred");
        expect(analyzerContent).not.toContain("An unexpected error occurred");
        expect(apiContent).toContain("corrupted or in an unsupported format");
        expect(analyzerContent).toContain("valid JPEG or PNG");
    });

    it("about page has real GitHub and LinkedIn URLs", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/pages/About.jsx", "utf-8");

        expect(content).toContain("https://github.com/garv-codes");
        expect(content).toContain("https://www.linkedin.com/in/garv-gujral-931a3b246/");
        expect(content).not.toMatch(/href="https:\/\/github\.com"/);
        expect(content).not.toMatch(/href="https:\/\/linkedin\.com"/);
    });

    it("no Lorem Ipsum text exists anywhere in source", async () => {
        const fs = await import("fs");
        const path = await import("path");
        const srcFiles = [
            "src/pages/LandingPage.jsx",
            "src/pages/About.jsx",
            "src/pages/Analyzer.jsx",
            "src/pages/Architecture.jsx",
            "src/pages/LoginPage.jsx",
            "src/components/UploadZone.jsx",
            "src/components/AnalysisResults.jsx",
            "src/components/HistoryPanel.jsx",
            "src/components/ScannerOverlay.jsx",
        ];
        for (const file of srcFiles) {
            const content = fs.readFileSync(file, "utf-8").toLowerCase();
            expect(content).not.toContain("lorem ipsum");
        }
    });
});

// ─── Mobile Responsiveness Tests ────────────────────────────────────────────

describe("Mobile Responsiveness (CSS class verification)", () => {
    it("hero heading uses text-4xl on mobile (≤ 2.25rem)", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/pages/LandingPage.jsx", "utf-8");
        // Should be text-4xl (2.25rem) not text-5xl+ on mobile
        expect(content).toMatch(/text-4xl\s+md:text-7xl/);
        expect(content).not.toMatch(/text-5xl\s+md:text-7xl/);
    });

    it("navbar buttons have min-h-[44px] for touch targets", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/pages/LandingPage.jsx", "utf-8");
        const minHeightCount = (content.match(/min-h-\[44px\]/g) || []).length;
        expect(minHeightCount).toBeGreaterThanOrEqual(2);
    });

    it("How It Works grid stacks vertically on mobile", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/pages/LandingPage.jsx", "utf-8");
        expect(content).toContain("grid-cols-1 md:grid-cols-2 lg:grid-cols-4");
    });

    it("cards use responsive padding (p-5 md:p-8)", async () => {
        const fs = await import("fs");
        const about = fs.readFileSync("src/pages/About.jsx", "utf-8");
        expect(about).toContain("p-5 md:p-8");
    });
});

// ─── Results Display Tests ──────────────────────────────────────────────────

describe("Confidence Score Display", () => {
    it("mobile shows combined score+label format like '94% Fake'", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/components/AnalysisResults.jsx", "utf-8");
        // Should show combined format: {confidence}% {label}
        expect(content).toContain('{result.confidence.toFixed(0)}% {isReal ? "Real" : "Fake"}');
    });

    it("verdict badges say LIKELY AUTHENTIC / LIKELY AI GENERATED", async () => {
        const fs = await import("fs");
        const content = fs.readFileSync("src/components/AnalysisResults.jsx", "utf-8");
        expect(content).toContain("LIKELY AUTHENTIC");
        expect(content).toContain("LIKELY AI GENERATED");
    });
});
