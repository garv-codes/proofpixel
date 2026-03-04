import { Shield, Cpu, User, ScanEye } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Analyzer", path: "/", icon: ScanEye },
  { title: "Architecture", path: "/architecture", icon: Cpu },
  { title: "About", path: "/about", icon: User },
];

export function AppSidebar() {
  return (
    <aside className="w-64 min-h-screen border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-green">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-foreground text-sm tracking-wider">DEEPFAKE</h1>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">DETECTOR v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary border-glow-green border"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          SYSTEM ONLINE
        </div>
      </div>
    </aside>
  );
}
