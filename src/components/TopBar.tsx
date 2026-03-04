import { Shield } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary/10 glow-green">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-mono font-bold text-foreground text-xs tracking-wider">DEEPFAKE DETECTOR</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        ONLINE
      </div>
    </header>
  );
}
