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

import { ShieldCheck, ShieldAlert, AlertTriangle, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AnalysisResults({ result, onNewScan }) {
    const isReal = result.label === "Real";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono text-center max-w-sm mx-auto leading-relaxed mt-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Analysis is probabilistic — verify with additional methods.
                    </div>
                </div>
            </div>

            {/* ── Forensic Breakdown Grid (XAI Maps) ──────────────── */}
            {result.ela_image && result.fft_image && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                    {/* ELA Card */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-slate-200 font-mono">Error Level Analysis</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="focus:outline-none">
                                            <Info className="h-4 w-4 text-slate-400 hover:text-slate-200 transition-colors" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[250px] bg-slate-800 border-slate-700 text-slate-200">
                                        <p className="text-xs">Highlights areas with inconsistent compression, often indicating digital manipulation.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="rounded-lg overflow-hidden bg-black/80 aspect-square flex items-center justify-center relative group flex-1">
                            <img src={result.ela_image} alt="Error Level Analysis Map" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>

                    {/* FFT Card */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-slate-200 font-mono">Frequency Spectrum</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="focus:outline-none">
                                            <Info className="h-4 w-4 text-slate-400 hover:text-slate-200 transition-colors" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[250px] bg-slate-800 border-slate-700 text-slate-200">
                                        <p className="text-xs">Analyzes pixel patterns in the frequency domain to find artificial checkerboard artifacts.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="rounded-lg overflow-hidden bg-black/80 aspect-square flex items-center justify-center relative group flex-1">
                            <img src={result.fft_image} alt="Frequency Spectrum Map" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── New Scan CTA ────────────────────────────────────── */}
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 fill-mode-both">
                <Button
                    variant="neon-outline"
                    size="lg"
                    className="w-full font-mono text-sm min-h-[48px] hover:scale-[1.02] transition-all duration-300"
                    onClick={onNewScan}
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Scan
                </Button>
            </div>
        </div>
    );
}
