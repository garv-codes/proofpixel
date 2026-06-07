/**
 * UploadZone — Clean upload interface
 *
 * Desktop: Drag-and-drop zone with dashed border
 * Mobile: Action buttons for camera and gallery access
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
            {/* Desktop: Drag-and-drop zone */}
            <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                className={`hidden md:block relative rounded-2xl transition-all duration-300 cursor-pointer
                    bg-zinc-900/50
                    border ${isDragOver
                        ? "border-indigo-400 bg-indigo-500/5"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
            >
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={onFileInput}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {/* Inner dashed border zone */}
                <div className="m-4 border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center transition-colors">
                    <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-4 transition-all duration-300 ${isDragOver
                        ? "bg-indigo-500/15"
                        : "bg-zinc-800/50"
                        }`}>
                        <Upload className={`h-10 w-10 transition-all duration-300 ${isDragOver ? "text-indigo-300 scale-110" : "text-zinc-400"
                            }`} />
                    </div>

                    <p className="text-base font-medium text-zinc-200">
                        {isDragOver ? "Release to start detection" : "Drop an image to check for compression artifacts, frequency anomalies, and structural edge patterns."}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                        Supports JPG, JPEG, PNG
                    </p>

                    {/* Trust badge */}
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700">
                        <ShieldCheck className="h-3 w-3 text-indigo-400" />
                        <span className="text-[10px] text-zinc-500">
                            Secure · Server-side processing
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile: action buttons */}
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

                {/* Primary CTA */}
                <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full min-h-[56px] rounded-xl bg-indigo-500 text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all duration-200 active:scale-[0.98]"
                >
                    <Camera className="h-5 w-5" />
                    Take Photo
                </button>

                {/* Secondary CTA */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[56px] rounded-xl bg-zinc-900/50 border border-zinc-700 text-zinc-300 font-semibold text-base flex items-center justify-center gap-2 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all duration-200 active:scale-[0.98]"
                >
                    <ImageIcon className="h-5 w-5" />
                    Choose from Gallery
                </button>
            </div>

            <p className="text-center text-xs text-zinc-500">
                Supported: .JPG .JPEG .PNG · Max 10MB
            </p>
        </div>
    );
}
