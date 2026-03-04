interface ConfidenceRingProps {
  percentage: number;
  isReal: boolean;
}

export function ConfidenceRing({ percentage, isReal }: ConfidenceRingProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = isReal ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 55%)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke="hsl(220, 15%, 14%)"
          strokeWidth="8"
        />
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-mono font-bold ${isReal ? "text-primary text-glow-green" : "text-destructive text-glow-red"}`}>
          {percentage.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground font-mono">CONFIDENCE</span>
      </div>
    </div>
  );
}
