/**
 * TopBar — Mobile-only sticky header
 *
 * Visible only below the `md:` breakpoint (hidden on desktop where the
 * sidebar provides branding). Uses `backdrop-blur-md` for a frosted-glass
 * effect that lets content scroll beneath it.
 */

import { Shield } from "lucide-react";

export function TopBar() {
    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden">
            {/* Brand mark */}
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 glow-green flex items-center justify-center">
                    <span className="text-lg">🛡️</span>
                </div>
                <div>
                    <h1 className="font-mono font-bold text-white text-xs tracking-wider">
                        PROOFPIXEL
                    </h1>
                </div>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                ONLINE
            </div>
        </header>
    );
}
