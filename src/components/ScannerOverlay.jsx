/**
 * ScannerOverlay — Animated scanning effect for the SCANNING state
 *
 * Renders a glowing emerald line that sweeps top-to-bottom over the
 * uploaded image preview, plus cycling scan-step text beneath it.
 *
 * HOW THE ANIMATION WORKS:
 *   The scanner line is a thin div with an emerald gradient and box-shadow.
 *   It uses the `animate-scanner` Tailwind utility (defined in tailwind.config.js)
 *   which applies `translateY(0%) → translateY(2000%)` over 2.5s.
 *   This creates the classic "scanning" visual without any JS animation
 *   library — pure CSS transforms on the GPU compositor thread.
 *
 * Props:
 *   @param {string}  preview   — Data URL of the uploaded image
 *   @param {boolean} isScanning — Whether the scan animation should be active
 *   @param {string}  scanStepText — Current step description to display
 *   @param {() => void} onClear — Callback to remove the current image
 */

import { X } from "lucide-react";

export function ScannerOverlay({ preview, isScanning, scanStepText, onClear }) {
    return (
        <div className="space-y-4">
            {/* ── Image preview container ────────────────────────── */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                {/* Clear button — absolute-positioned top-right corner */}
                <button
                    onClick={onClear}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-110"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Image + scanner overlay wrapper */}
                <div className={`relative ${isScanning ? "opacity-80" : ""} transition-opacity duration-500`}>
                    <img
                        src={preview}
                        alt="Upload preview"
                        className="w-full max-h-[350px] md:max-h-[400px] object-contain bg-slate-950/50"
                    />

                    {/* ── Scanner line ─────────────────────────────────
                     * Only rendered during the SCANNING state.
                     * The green line + box-shadow creates the "laser scan"
                     * effect. pointer-events-none ensures it doesn't block
                     * clicks on the close button above. */}
                    {isScanning && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_hsl(160_84%_39%),0_0_40px_hsl(160_84%_39%/0.5)] animate-scanner" />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Scan step indicator ─────────────────────────────── */}
            {isScanning && (
                <div className="text-center space-y-2 animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                        {/* Inline SVG spinner — avoids importing a whole icon
                         * library just for a loading indicator */}
                        <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                        </svg>
                        <p className="text-sm font-mono text-emerald-400 text-glow-green animate-pulse">
                            {scanStepText}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
