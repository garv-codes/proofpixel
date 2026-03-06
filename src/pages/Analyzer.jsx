/**
 * Analyzer Page — Core application page for AI image forensic analysis
 *
 * ═══════════════════════════════════════════════════════════════════════
 * STATE MACHINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ┌────────┐  file selected  ┌──────────┐  analysis done  ┌──────────┐
 *   │  IDLE  │ ──────────────→ │ SCANNING │ ──────────────→ │ RESULTS  │
 *   └────────┘                 └──────────┘                 └──────────┘
 *        ↑                                                       │
 *        └───────────────── "New Scan" click ────────────────────┘
 *
 * LAYOUT (responsive):
 *   Desktop: 12-column grid → Analyzer (col-span-8) + History (col-span-4)
 *   Mobile:  Stacked vertically → Analyzer on top, History below
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from "react";
import { ScanEye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeImage } from "@/services/api";
import { UploadZone } from "@/components/UploadZone";
import { ScannerOverlay } from "@/components/ScannerOverlay";
import { AnalysisResults } from "@/components/AnalysisResults";
import { HistoryPanel } from "@/components/HistoryPanel";

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
    const { user } = useAuth();
    const [appState, setAppState] = useState("IDLE");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [scanStep, setScanStep] = useState(0);
    const [historyRefresh, setHistoryRefresh] = useState(0);
    const { toast } = useToast();

    /* ── Scan step cycler ──────────────────────────────────────── */
    useEffect(() => {
        if (appState !== "SCANNING") return;
        setScanStep(0);
        const interval = setInterval(() => {
            setScanStep((s) => (s + 1) % SCAN_STEPS.length);
        }, 600);
        return () => clearInterval(interval);
    }, [appState]);

    /* ── File selection handler ──────────────────────────────────
     * Auto-starts analysis after a short delay for visual feedback. */
    const handleFileSelected = useCallback((selectedFile) => {
        setFile(selectedFile);
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result);
            setTimeout(() => runAnalysis(selectedFile), 300);
        };
        reader.readAsDataURL(selectedFile);
    }, []);

    /* ── API call ────────────────────────────────────────────────
     * Sends user ID via X-User-Id header for history tracking. */
    const runAnalysis = async (targetFile) => {
        setAppState("SCANNING");
        setResult(null);

        try {
            const data = await analyzeImage(targetFile, user?.id || null);
            setResult({
                label: data.is_ai_generated ? "Fake" : "Real",
                confidence: data.confidence,
            });
            setAppState("RESULTS");
            // Trigger history panel refresh after successful scan
            setHistoryRefresh((n) => n + 1);
        } catch (err) {
            toast({
                title: "Analysis Failed",
                description: err.message ?? "An unexpected error occurred.",
                variant: "destructive",
            });
            setAppState("IDLE");
        }
    };

    /* ── Reset handler ───────────────────────────────────────── */
    const handleNewScan = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setAppState("IDLE");
    };

    /* ═══════════════════════════════════════════════════════════
     * RENDER — Two-column grid on desktop, stacked on mobile
     * ═══════════════════════════════════════════════════════════ */
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Main Analyzer Column (8/12 on desktop) ───────── */}
            <div className="lg:col-span-8 space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
                        <ScanEye className="inline h-6 w-6 mr-2 text-emerald-400" />
                        Image Analyzer
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload an image to detect AI-generated artifacts
                    </p>
                </div>

                {/* IDLE → Upload zone */}
                {appState === "IDLE" && (
                    <UploadZone onFileSelected={handleFileSelected} />
                )}

                {/* SCANNING → Scanner overlay */}
                {appState === "SCANNING" && (
                    <ScannerOverlay
                        preview={preview}
                        isScanning={true}
                        scanStepText={SCAN_STEPS[scanStep]}
                        onClear={handleNewScan}
                    />
                )}

                {/* RESULTS → Verdict + image */}
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
            </div>

            {/* ── History Panel Column (4/12 on desktop) ────────── */}
            <div className="lg:col-span-4">
                <HistoryPanel
                    userId={user?.id}
                    refreshKey={historyRefresh}
                />
            </div>
        </div>
    );
}
