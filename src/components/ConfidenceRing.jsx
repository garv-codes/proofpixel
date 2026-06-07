/**
 * ConfidenceRing — Animated SVG confidence score visualizer
 *
 * Renders a circular progress ring using SVG `stroke-dasharray` and
 * `stroke-dashoffset`.
 *
 * Props:
 *   @param {number}  percentage — Confidence score from 0 to 100
 *   @param {boolean} isReal     — True if verdict is "Real", false for "Fake"
 */

export function ConfidenceRing({ percentage, isReal }) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    /* The offset determines how much of the circle's stroke is visible.
     * A full circle (100%) would have offset = 0. */
    const offset = circumference - (percentage / 100) * circumference;

    /* Color tokens — using exact Tailwind colors */
    const color = isReal ? "#22c55e" : "#ef4444"; // green-500 : red-500

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="180" height="180" className="-rotate-90">
                {/* Background track — subtle dark ring */}
                <circle
                    cx="90" cy="90" r={radius}
                    fill="none"
                    stroke="#27272a" // zinc-800
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
                />
            </svg>

            {/* Center label */}
            <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-bold ${isReal ? "text-green-500" : "text-red-500"}`}>
                    {percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-500 mt-1">CONFIDENCE</span>
            </div>
        </div>
    );
}
