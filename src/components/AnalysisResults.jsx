/**
 * AnalysisResults — Verdict display for the RESULTS state
 *
 * Shows the AI detection result with:
 *   - Mobile: large percentage text (for quick glanceability)
 *   - Desktop: animated SVG confidence ring (for detailed view)
 *   - Verdict badge: "AUTHENTIC" (emerald) or "AI GENERATED" (rose)
 *   - Disclaimer about probabilistic analysis
 *   - "Start New Scan" CTA to reset the flow
 *
 * Design rationale:
 *   The confidence ring uses SVG stroke-dasharray/dashoffset for the
 *   arc fill — this is more accessible and performant than canvas,
 *   with smooth CSS transitions on the offset value.
 *
 * Props:
 *   @param {{ label: string, confidence: number }} result — Analysis result
 *   @param {() => void} onNewScan — Callback to reset to IDLE state
 */

import { ShieldCheck, ShieldAlert, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceRing } from "@/components/ConfidenceRing";

export function AnalysisResults({ result, onNewScan }) {
    const isReal = result.label === "Real";

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ── Verdict Card ────────────────────────────────────── */}
            <div
                className={`rounded-xl border p-6 md:p-8 ${isReal
                        ? "border-emerald-500/30 bg-emerald-500/5 glow-green"
                        : "border-rose-500/30 bg-rose-500/5 glow-red"
                    }`}
            >
                <div className="flex flex-col items-center gap-5">
                    {/* Mobile: large percentage for quick readability */}
                    <div className="md:hidden text-center">
                        <span
                            className={`text-7xl font-mono font-black tracking-tighter ${isReal
                                    ? "text-emerald-400 text-glow-green"
                                    : "text-rose-400 text-glow-red"
                                }`}
                        >
                            {result.confidence.toFixed(0)}%
                        </span>
                        <p className="text-xs text-slate-500 font-mono mt-1">CONFIDENCE</p>
                    </div>

                    {/* Desktop: animated SVG confidence ring */}
                    <div className="hidden md:block">
                        <ConfidenceRing percentage={result.confidence} isReal={isReal} />
                    </div>

                    {/* Verdict badge */}
                    <div className="flex items-center gap-3">
                        {isReal ? (
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 glow-green">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <span className="font-mono font-bold text-sm text-emerald-400 text-glow-green">
                                    AUTHENTIC
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/15 border border-rose-500/30 glow-red">
                                <ShieldAlert className="h-5 w-5 text-rose-400" />
                                <span className="font-mono font-bold text-sm text-rose-400 text-glow-red">
                                    AI GENERATED
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Probabilistic disclaimer */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <AlertTriangle className="h-3 w-3" />
                        Analysis is probabilistic — verify with additional methods
                    </div>
                </div>
            </div>

            {/* ── New Scan CTA ────────────────────────────────────── */}
            <Button
                variant="neon-outline"
                size="lg"
                className="w-full font-mono text-sm min-h-[48px] hover:scale-105 transition-all duration-200"
                onClick={onNewScan}
            >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Scan
            </Button>
        </div>
    );
}
