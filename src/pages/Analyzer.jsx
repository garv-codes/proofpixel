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
import { ScanEye, Lightbulb } from "lucide-react";
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

                {/* IDLE → Upload zone + Tips */}
                {appState === "IDLE" && (
                    <>
                        <UploadZone onFileSelected={handleFileSelected} />

                        {/* Deepfake Detection Tips */}
                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 mb-6">
                                <Lightbulb className="h-5 w-5 text-amber-400" />
                                <h2 className="text-lg font-mono font-bold text-white tracking-tight">
                                    Deepfake Detection Tips
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-sm">
                                    <h3 className="font-bold font-mono text-slate-200 mb-2 truncate">Asymmetrical Lighting</h3>
                                    <p className="text-slate-400 leading-relaxed text-xs">
                                        Check if shadows align with the light sources. AI often struggles with global illumination consistency.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-sm">
                                    <h3 className="font-bold font-mono text-slate-200 mb-2 truncate">Unnatural Textures</h3>
                                    <p className="text-slate-400 leading-relaxed text-xs">
                                        Look closely at skin, hair, and clothing. AI models frequently blur details or create repetitive patterns.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-sm">
                                    <h3 className="font-bold font-mono text-slate-200 mb-2 truncate">Distorted Backgrounds</h3>
                                    <p className="text-slate-400 leading-relaxed text-xs">
                                        AI focuses on the main subject. Background objects, text, and straight lines are often warped or illegible.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-sm">
                                    <h3 className="font-bold font-mono text-slate-200 mb-2 truncate">Weird Hands & Teeth</h3>
                                    <p className="text-slate-400 leading-relaxed text-xs">
                                        Generators have trouble with complex anatomy. Look for extra fingers, blended teeth, or structural impossible geometry.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
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
