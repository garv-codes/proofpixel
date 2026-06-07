/**
 * TopBar — Mobile-only sticky header
 *
 * Visible only below the `md:` breakpoint (hidden on desktop where the
 * sidebar provides branding).
 */

import { ScanEye } from "lucide-react";

export function TopBar() {
    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md md:hidden">
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <ScanEye className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                    <h1 className="font-semibold text-white text-xs tracking-wide">
                        ProofPixel
                    </h1>
                </div>
            </div>
        </header>
    );
}
