/**
 * BottomNav — Mobile-only bottom navigation bar
 *
 * Fixed to the viewport bottom, hidden on `md:` and above (where the
 * sidebar is visible instead). Uses `backdrop-blur-md` for frosted glass.
 *
 * Active route gets an emerald dot indicator above the icon for a subtle,
 * app-native feel.
 */

import { ScanEye, Cpu, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
    { title: "Analyze", path: "/", icon: ScanEye },
    { title: "Architecture", path: "/architecture", icon: Cpu },
    { title: "About", path: "/about", icon: User },
];

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-2 rounded-lg",
                                "transition-all duration-200",
                                isActive
                                    ? "text-emerald-400"
                                    : "text-slate-500 active:scale-95"
                            )
                        }
                    >
                        {/* Active indicator dot — only visible for current route */}
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="h-1 w-1 rounded-full bg-emerald-400 absolute -top-0.5" />
                                )}
                                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-500")} />
                                <span className={cn("text-[10px] font-mono font-medium", isActive ? "text-emerald-400" : "text-slate-500")}>
                                    {item.title}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
