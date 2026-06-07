/**
 * ScannerOverlay — Animated scanning effect for the SCANNING state
 *
 * Renders a subtle indigo line that sweeps top-to-bottom over the
 * uploaded image preview, plus cycling scan-step text beneath it.
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
            {/* Image preview container */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                {/* Clear button */}
                <button
                    onClick={onClear}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Image + scanner overlay wrapper */}
                <div className={`relative ${isScanning ? "opacity-80" : ""} transition-opacity duration-500`}>
                    <img
                        src={preview}
                        alt="Upload preview"
                        className="w-full max-h-[350px] md:max-h-[400px] object-contain bg-zinc-950/50"
                    />

                    {/* Scanner line — subtle indigo sweep */}
                    {isScanning && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-80 animate-scanner" />
                        </div>
                    )}
                </div>
            </div>

            {/* Scan step indicator */}
            {isScanning && (
                <div className="text-center space-y-2 animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                        </svg>
                        <p className="text-sm text-indigo-400 animate-pulse">
                            {scanStepText}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
