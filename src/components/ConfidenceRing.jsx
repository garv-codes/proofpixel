/**
 * ConfidenceRing — Animated SVG confidence score visualizer
 *
 * Renders a circular progress ring using SVG `stroke-dasharray` and
 * `stroke-dashoffset`. This technique works by:
 *
 *   1. Drawing a circle with `strokeDasharray = circumference`
 *      (the total perimeter length of the circle).
 *
 *   2. Setting `strokeDashoffset = circumference - (percentage/100 * circumference)`
 *      which "hides" the undrawn portion, visually creating an arc
 *      that fills proportionally to the confidence score.
 *
 *   3. The `-rotate-90` on the SVG rotates the start point from
 *      3 o'clock (SVG default) to 12 o'clock for a natural reading.
 *
 *   4. A CSS `transition-all duration-1000` smoothly animates the offset
 *      change when the result first renders.
 *
 * Props:
 *   @param {number}  percentage — Confidence score from 0 to 100
 *   @param {boolean} isReal     — True if verdict is "Real" (emerald), false for "Fake" (rose)
 */

export function ConfidenceRing({ percentage, isReal }) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    /* The offset determines how much of the circle's stroke is visible.
     * A full circle (100%) would have offset = 0. */
    const offset = circumference - (percentage / 100) * circumference;

    /* Color tokens — using raw HSL values so we can also apply them
     * to the SVG filter for the glow drop-shadow. */
    const color = isReal ? "hsl(160, 84%, 39%)" : "hsl(0, 72%, 55%)";

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="180" height="180" className="-rotate-90">
                {/* Background track — subtle dark ring */}
                <circle
                    cx="90" cy="90" r={radius}
                    fill="none"
                    stroke="hsl(220, 15%, 12%)"
                    strokeWidth="8"
                />

                {/* Foreground arc — fills proportionally to the confidence % */}
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

            {/* Center label */}
            <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-mono font-bold ${isReal ? "text-emerald-400 text-glow-green" : "text-rose-400 text-glow-red"}`}>
                    {percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">CONFIDENCE</span>
            </div>
        </div>
    );
}
