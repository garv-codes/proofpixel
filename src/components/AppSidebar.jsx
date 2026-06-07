/**
 * AppSidebar — Desktop navigation sidebar with auth controls
 *
 * Clean professional design with indigo accent for active states.
 */

import { Cpu, User, ScanEye, LogOut } from "lucide-react";
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
        <aside className="w-64 min-h-screen border-r border-zinc-800 bg-zinc-950 flex flex-col">
            {/* Brand Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <ScanEye className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-white text-sm tracking-wide">
                            ProofPixel
                        </h1>
                        <p className="text-[10px] text-zinc-500 tracking-wide">
                            Image Forensics
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                                "transition-colors duration-200",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info + Sign Out */}
            <div className="p-4 border-t border-zinc-800 space-y-3">
                {user && (
                    <>
                        <div className="text-[11px] text-zinc-500 truncate" title={user.email}>
                            {user.email}
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}
