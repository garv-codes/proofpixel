/**
 * UploadZone — File upload interface for the IDLE application state
 *
 * This component handles two distinct upload experiences:
 *
 *   1. Desktop (md:+) → Drag-and-drop zone with dashed border
 *   2. Mobile (<md)   → "Take Photo" and "Choose from Gallery" buttons
 *
 * WHY two modes?
 *   Mobile browsers don't support drag-and-drop well, and users expect
 *   native-feeling camera/gallery pickers on phones. The `capture="environment"`
 *   attribute triggers the rear camera on mobile devices.
 *
 * Props:
 *   @param {(file: File) => void} onFileSelected — Callback invoked with
 *     the validated image File after the user selects or drops one.
 */

import { useRef, useCallback } from "react";
import { Upload, Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/* Accepted MIME types — we only support raster image formats that the
 * backend's OpenCV pipeline can process. */
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export function UploadZone({ onFileSelected }) {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    /* ── File validation ────────────────────────────────────────────────
     * Centralizes the type-check so both drag-drop and input[file] share
     * the same validation logic. Shows a toast on invalid types instead
     * of silently failing, which is better UX. */
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

    /* ── Drag-and-drop handler ──────────────────────────────────────────
     * Grabs the first file from the DataTransfer API — we only support
     * single-file uploads for forensic analysis. */
    const onDrop = useCallback(
        (e) => {
            e.preventDefault();
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
            {/* ── Desktop: drag-and-drop zone ────────────────────── */}
            <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="hidden md:block relative border-2 border-dashed border-slate-700 rounded-xl p-16 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer group"
            >
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={onFileInput}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="h-12 w-12 mx-auto text-slate-500 group-hover:text-emerald-400 transition-colors duration-300" />
                <p className="mt-4 text-sm font-medium text-slate-300">
                    Drop image here or click to upload
                </p>
                <p className="mt-1 text-xs text-slate-500 font-mono">
                    .JPG .JPEG .PNG
                </p>
            </div>

            {/* ── Mobile: native camera / gallery buttons ─────────── */}
            <div className="flex flex-col gap-3 md:hidden">
                {/* Hidden file inputs — triggered programmatically via refs
                 * to avoid ugly native file-input styling */}
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
                <Button
                    variant="neon"
                    size="lg"
                    className="w-full min-h-[52px] text-base font-mono hover:scale-105 transition-all duration-200"
                    onClick={() => cameraInputRef.current?.click()}
                >
                    <Camera className="h-5 w-5 mr-2" />
                    Take Photo
                </Button>
                <Button
                    variant="neon-outline"
                    size="lg"
                    className="w-full min-h-[52px] text-base font-mono hover:scale-105 transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Choose from Gallery
                </Button>
            </div>

            <p className="text-center text-xs text-slate-500 font-mono">
                Supported: .JPG .JPEG .PNG
            </p>
        </div>
    );
}
