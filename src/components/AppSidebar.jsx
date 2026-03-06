/**
 * AppSidebar — Desktop navigation sidebar
 *
 * Renders a fixed-width sidebar visible on `md:` breakpoints and above.
 * Uses react-router-dom's <NavLink> for declarative active-state styling.
 *
 * Design decisions:
 *   - `hover:scale-105 transition-all` on nav items for snappy micro-interactions
 *   - Active nav item gets an emerald border glow to indicate current page
 *   - "SYSTEM ONLINE" indicator pulses using the Tailwind `animate-pulse-glow` utility
 */

import { Shield, Cpu, User, ScanEye } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

/* Navigation items — defined outside the component to avoid re-creation on
 * every render. Each entry maps a route to its icon and display label. */
const navItems = [
    { title: "Analyzer", path: "/", icon: ScanEye },
    { title: "Architecture", path: "/architecture", icon: Cpu },
    { title: "About", path: "/about", icon: User },
];

export function AppSidebar() {
    return (
        <aside className="w-64 min-h-screen border-r border-slate-800 bg-slate-950 flex flex-col">
            {/* ── Brand Header ────────────────────────────────── */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 glow-green">
                        <Shield className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="font-mono font-bold text-white text-sm tracking-wider">
                            PROOFPIXEL
                        </h1>
                        <p className="font-mono text-[10px] text-slate-500 tracking-widest">
                            AI FORENSICS v1.0
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Navigation Links ────────────────────────────── */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                            cn(
                                /* Base styles shared between active and inactive states */
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                                /* hover:scale-105 gives a subtle "lift" micro-interaction */
                                "hover:scale-105 transition-all duration-200",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-green"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </NavLink>
                ))}
            </nav>

            {/* ── System Status Indicator ─────────────────────── */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                    SYSTEM ONLINE
                </div>
            </div>
        </aside>
    );
}
