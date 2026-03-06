/**
 * Analyzer Page — Core application page for AI image forensic analysis
 *
 * ═══════════════════════════════════════════════════════════════════════
 * STATE MACHINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * The page follows a simple 3-state finite state machine:
 *
 *   ┌────────┐  file selected  ┌──────────┐  analysis done  ┌──────────┐
 *   │  IDLE  │ ──────────────→ │ SCANNING │ ──────────────→ │ RESULTS  │
 *   └────────┘                 └──────────┘                 └──────────┘
 *        ↑                                                       │
 *        └───────────────── "New Scan" click ────────────────────┘
 *
 * WHY a state machine?
 *   Instead of tracking multiple boolean flags (loading, hasResult, etc.),
 *   a single `appState` variable eliminates impossible state combinations
 *   and makes the render logic trivially clear.
 *
 * COMPONENT COMPOSITION:
 *   - IDLE     → <UploadZone />       — handles drag-drop and file input
 *   - SCANNING → <ScannerOverlay />   — animated green scan line
 *   - RESULTS  → <AnalysisResults />  — verdict card with confidence ring
 *
 * This decomposition reduces this file from ~275 lines to ~130 lines,
 * with each sub-component being independently testable and reusable.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from "react";
import { ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeImage } from "@/services/api";
import { UploadZone } from "@/components/UploadZone";
import { ScannerOverlay } from "@/components/ScannerOverlay";
import { AnalysisResults } from "@/components/AnalysisResults";

/* ── Scan step messages ──────────────────────────────────────────────
 * Displayed sequentially during the SCANNING state to give the user
 * real-time feedback about what the ML pipeline is doing. */
const SCAN_STEPS = [
    "Converting to grayscale...",
    "Applying Gaussian blur...",
    "Extracting HOG features...",
    "Computing gradient orientations...",
    "Building feature vector...",
    "Running Random Forest classifier...",
    "Aggregating decision trees...",
    "Calculating confidence score...",
];

export default function Analyzer() {
    /* ── Application state ───────────────────────────────────────────
     * `appState` drives which component tree is rendered.
     * `file` + `preview` hold the current upload.
     * `result` holds the API response after analysis completes. */
    const [appState, setAppState] = useState("IDLE"); // "IDLE" | "SCANNING" | "RESULTS"
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [scanStep, setScanStep] = useState(0);
    const { toast } = useToast();

    /* ── Scan step cycler ────────────────────────────────────────────
     * Cycles through SCAN_STEPS every 600ms while in SCANNING state.
     * The interval is cleaned up when the state changes, preventing
     * memory leaks and zombie intervals. */
    useEffect(() => {
        if (appState !== "SCANNING") return;
        setScanStep(0);
        const interval = setInterval(() => {
            setScanStep((s) => (s + 1) % SCAN_STEPS.length);
        }, 600);
        return () => clearInterval(interval);
    }, [appState]);

    /* ── File selection handler ──────────────────────────────────────
     * Called by <UploadZone> when the user selects a valid image.
     * Reads the file as a data URL for preview, then auto-starts
     * analysis (skipping an extra "Analyze" button tap on mobile). */
    const handleFileSelected = useCallback((selectedFile) => {
        setFile(selectedFile);
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result);
            // Small delay before starting analysis for visual feedback
            setTimeout(() => runAnalysis(selectedFile), 300);
        };
        reader.readAsDataURL(selectedFile);
    }, []);

    /* ── API call ────────────────────────────────────────────────────
     * Sends the file to the FastAPI backend and transitions state:
     *   IDLE → SCANNING → RESULTS (or back to SCANNING state on error)
     */
    const runAnalysis = async (targetFile) => {
        setAppState("SCANNING");
        setResult(null);

        try {
            const data = await analyzeImage(targetFile);
            setResult({
                label: data.is_ai_generated ? "Fake" : "Real",
                confidence: data.confidence,
            });
            setAppState("RESULTS");
        } catch (err) {
            toast({
                title: "Analysis Failed",
                description: err.message ?? "An unexpected error occurred.",
                variant: "destructive",
            });
            setAppState("IDLE");
        }
    };

    /* ── Reset handler ───────────────────────────────────────────────
     * Clears all state and returns to the IDLE upload screen. */
    const handleNewScan = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setAppState("IDLE");
    };

    /* ═══════════════════════════════════════════════════════════════
     * RENDER — Each state maps to exactly one component branch
     * ═══════════════════════════════════════════════════════════════ */
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Page header — always visible */}
            <div>
                <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
                    <ScanEye className="inline h-6 w-6 mr-2 text-emerald-400" />
                    Image Analyzer
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Upload an image to detect AI-generated artifacts
                </p>
            </div>

            {/* ── IDLE STATE: Show upload zone ── */}
            {appState === "IDLE" && (
                <UploadZone onFileSelected={handleFileSelected} />
            )}

            {/* ── SCANNING STATE: Show image with scanner overlay ── */}
            {appState === "SCANNING" && (
                <ScannerOverlay
                    preview={preview}
                    isScanning={true}
                    scanStepText={SCAN_STEPS[scanStep]}
                    onClear={handleNewScan}
                />
            )}

            {/* ── RESULTS STATE: Show verdict + image preview ── */}
            {appState === "RESULTS" && (
                <>
                    <ScannerOverlay
                        preview={preview}
                        isScanning={false}
                        scanStepText=""
                        onClear={handleNewScan}
                    />
                    <AnalysisResults result={result} onNewScan={handleNewScan} />
                </>
            )}

            {/* Desktop-only manual run button — shown when image is selected
             * but analysis hasn't started (edge case: drag-drop without auto-run) */}
            {appState === "IDLE" && file && !result && (
                <Button
                    variant="neon"
                    size="lg"
                    className="w-full font-mono text-sm hidden md:flex hover:scale-105 transition-all duration-200"
                    onClick={() => runAnalysis(file)}
                >
                    <ScanEye className="h-4 w-4 mr-2" />
                    Run AI Analysis
                </Button>
            )}
        </div>
    );
}
