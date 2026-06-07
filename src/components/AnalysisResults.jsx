/**
 * AnalysisResults — Verdict display for the RESULTS state
 *
 * Shows the AI detection result with:
 *   - Mobile: large percentage text
 *   - Desktop: animated SVG confidence ring
 *   - Verdict badge: "LIKELY AUTHENTIC" or "LIKELY AI GENERATED"
 *   - Disclaimer about probabilistic analysis
 *   - "Start New Scan" CTA to reset the flow
 */

import { ShieldCheck, ShieldAlert, AlertTriangle, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AnalysisResults({ result, onNewScan }) {
    const isReal = result.label === "Real";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Verdict Card */}
            <div
                className={`rounded-xl border p-6 md:p-8 ${isReal
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/30 bg-red-500/5"
                    }`}
            >
                <div className="flex flex-col items-center gap-5">
                    {/* Mobile: prominent combined score + label */}
                    <div className="md:hidden text-center">
                        <span
                            className={`text-6xl font-bold tracking-tighter ${isReal
                                ? "text-green-500"
                                : "text-red-500"
                                }`}
                        >
                            {result.confidence.toFixed(0)}% {isReal ? "Real" : "Fake"}
                        </span>
                    </div>

                    {/* Desktop: animated SVG confidence ring */}
                    <div className="hidden md:block">
                        <ConfidenceRing percentage={result.confidence} isReal={isReal} />
                    </div>

                    {/* Verdict badge */}
                    <div className="flex items-center gap-3">
                        {isReal ? (
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/15 border border-green-500/30">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                <span className="font-bold text-sm text-green-500">
                                    LIKELY AUTHENTIC
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/15 border border-red-500/30">
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                                <span className="font-bold text-sm text-red-500">
                                    LIKELY AI GENERATED
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Probabilistic disclaimer */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 text-center max-w-sm mx-auto leading-relaxed mt-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Analysis is probabilistic — verify with additional methods.
                    </div>
                </div>
            </div>

            {/* Forensic Breakdown Grid (XAI Maps) */}
            {result.ela_image && result.fft_image && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                    {/* ELA Card */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-zinc-200">Error Level Analysis</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="focus:outline-none">
                                            <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[250px] bg-zinc-800 border-zinc-700 text-zinc-200">
                                        <p className="text-xs">Highlights areas with inconsistent compression, often indicating digital manipulation.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="rounded-lg overflow-hidden bg-black/80 aspect-square flex items-center justify-center relative group flex-1 border border-zinc-800/50">
                            <img src={result.ela_image} alt="Error Level Analysis Map" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* FFT Card */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-zinc-200">Frequency Spectrum</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="focus:outline-none">
                                            <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[250px] bg-zinc-800 border-zinc-700 text-zinc-200">
                                        <p className="text-xs">Analyzes pixel patterns in the frequency domain to find artificial checkerboard artifacts.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="rounded-lg overflow-hidden bg-black/80 aspect-square flex items-center justify-center relative group flex-1 border border-zinc-800/50">
                            <img src={result.fft_image} alt="Frequency Spectrum Map" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}

            {/* New Scan CTA */}
            <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 fill-mode-both">
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-sm min-h-[48px] hover:scale-[1.02] transition-all duration-300 border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800"
                    onClick={onNewScan}
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Scan
                </Button>
            </div>
        </div>
    );
}
