/**
 * BottomNav — Mobile-only bottom navigation bar
 *
 * Fixed to the viewport bottom, hidden on `md:` and above where the
 * sidebar is visible instead.
 */

import { ScanEye, Cpu, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
    { title: "Analyze", path: "/dashboard", icon: ScanEye },
    { title: "Architecture", path: "/architecture", icon: Cpu },
    { title: "About", path: "/about", icon: User },
];

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-2 rounded-lg",
                                "transition-colors duration-200",
                                isActive
                                    ? "text-indigo-400"
                                    : "text-zinc-500 active:scale-95"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-zinc-500")} />
                                <span className={cn("text-[10px] font-medium", isActive ? "text-indigo-400" : "text-zinc-500")}>
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
