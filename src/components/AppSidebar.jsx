/**
 * AppSidebar — Desktop navigation sidebar with auth controls
 *
 * Shows user email and sign-out button at the bottom when authenticated.
 * Uses hover:scale-105 micro-interactions on nav items.
 */

import { Shield, Cpu, User, ScanEye, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { title: "Analyzer", path: "/dashboard", icon: ScanEye },
    { title: "Architecture", path: "/architecture", icon: Cpu },
    { title: "About", path: "/about", icon: User },
];

export function AppSidebar() {
    const { user, signOut } = useAuth();

    return (
        <aside className="w-64 min-h-screen border-r border-slate-800 bg-slate-950 flex flex-col">
            {/* ── Brand Header ────────────────────────────────── */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="ProofPixel Logo" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
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
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
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

            {/* ── User Info + Sign Out ────────────────────────── */}
            <div className="p-4 border-t border-slate-800 space-y-3">
                {user && (
                    <>
                        <div className="text-[11px] font-mono text-slate-500 truncate" title={user.email}>
                            {user.email}
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    </>
                )}
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                    SYSTEM ONLINE
                </div>
            </div>
        </aside>
    );
}
