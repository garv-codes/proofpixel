/**
 * UploadZone — High-tech glassmorphism upload interface
 *
 * DESIGN PHILOSOPHY:
 *   The upload zone is the absolute focal point of the Analyzer page.
 *   It uses a glassmorphism aesthetic (backdrop-blur + semi-transparent bg)
 *   with a glowing emerald border that intensifies on hover/drag-over.
 *
 *   Desktop: Drag-and-drop zone with inner dashed border + glowing icon
 *   Mobile:  Gradient action buttons for camera and gallery access
 *
 * Props:
 *   @param {(file: File) => void} onFileSelected — Callback with validated File
 */

import { useRef, useCallback, useState } from "react";
import { Upload, Camera, ImageIcon, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export function UploadZone({ onFileSelected }) {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = useCallback(
        (file) => {
            if (!VALID_TYPES.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Only .jpg, .jpeg, and .png files are accepted.",
                    variant: "destructive",
                });
                return;
            }
            onFileSelected(file);
        },
        [onFileSelected, toast]
    );

    const onDrop = useCallback(
        (e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const onFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            {/* ── Desktop: Glassmorphism drag-and-drop zone ──────────────
             * Outer container uses bg-slate-900/50 + backdrop-blur-md for the
             * frosted glass effect. Border transitions from emerald-500/30 to
             * emerald-400 on hover/drag-over for a "reactive" feel. */}
            <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                className={`hidden md:block relative rounded-2xl transition-all duration-300 cursor-pointer
                    bg-slate-900/50 backdrop-blur-md
                    border ${isDragOver
                        ? "border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                        : "border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                    }`}
            >
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={onFileInput}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {/* Inner dashed border zone */}
                <div className="m-4 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center group-hover:border-slate-600 transition-colors">
                    {/* Glowing upload icon */}
                    <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-4 transition-all duration-300 ${isDragOver
                            ? "bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            : "bg-emerald-500/10"
                        }`}>
                        <Upload className={`h-10 w-10 transition-all duration-300 ${isDragOver ? "text-emerald-300 scale-110" : "text-emerald-400"
                            }`} />
                    </div>

                    <p className="text-base font-medium text-slate-200">
                        {isDragOver ? "Release to analyze" : "Drop image here or click to upload"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 font-mono">
                        Supports JPG, JPEG, PNG
                    </p>

                    {/* Trust badge */}
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] font-mono text-slate-500">
                            SECURE • LOCAL PROCESSING
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Mobile: gradient action buttons ──────────────────────
             * bg-gradient-to-r from-emerald-500 to-teal-500 creates the
             * eye-catching gradient. The second button uses a ghost style
             * with ring border for visual hierarchy. */}
            <div className="flex flex-col gap-3 md:hidden">
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    capture="environment"
                    onChange={onFileInput}
                    className="hidden"
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={onFileInput}
                    className="hidden"
                />

                {/* Primary CTA — gradient background */}
                <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full min-h-[56px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-mono font-semibold text-base flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                >
                    <Camera className="h-5 w-5" />
                    Take Photo
                </button>

                {/* Secondary CTA — glassmorphism outline */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[56px] rounded-xl bg-slate-900/50 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-mono font-semibold text-base flex items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <ImageIcon className="h-5 w-5" />
                    Choose from Gallery
                </button>
            </div>

            <p className="text-center text-xs text-slate-500 font-mono">
                Supported: .JPG .JPEG .PNG • Max 10MB
            </p>
        </div>
    );
}
