/**
 * Architecture Page — Technical pipeline documentation
 *
 * Displays the 3-step ML pipeline (Preprocessing → HOG → Random Forest)
 * in a visual timeline layout. Designed for both end-users and technical
 * interviewers to understand the system architecture at a glance.
 */

import { Cpu, ImageDown, BarChart3, TreePine } from "lucide-react";

const steps = [
    {
        num: "01",
        title: "Data Preprocessing & Grayscaling",
        icon: ImageDown,
        desc: "Input images are resized to a uniform 128×128 resolution and converted to grayscale to reduce dimensionality.",
        details: ["RGB → Grayscale", "Bilinear interpolation", "Pixel normalization"],
    },
    {
        num: "02",
        title: "HOG Feature Extraction",
        icon: BarChart3,
        desc: "Computes gradient magnitudes and orientations to capture local texture patterns.",
        details: ["8×8 pixel cells", "9 orientation bins (0°–180°)"],
    },
    {
        num: "03",
        title: "Random Forest Classification",
        icon: TreePine,
        desc: "An ensemble of 200 decision trees votes on extracted HOG features. Majority vote determines the final Real/Fake classification.",
        details: ["200 estimators", "Bootstrap aggregation", "Probability calibration"],
    },
];

export default function Architecture() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-cyan-400" />
                    System Architecture
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Technical pipeline for deepfake image detection.
                </p>
            </div>

            {/* Timeline */}
            <div className="relative pl-8">
                {/* Dashed vertical connector line */}
                <div className="absolute left-3 top-3 bottom-3 w-px border-l-2 border-dashed border-slate-800" />

                <div className="space-y-6">
                    {steps.map((step) => (
                        <div key={step.num} className="relative animate-fade-in">
                            {/* Timeline node — emerald dot with glow */}
                            <div className="absolute -left-8 top-6 flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_10px_hsl(160_84%_39%/0.4)]">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                </div>
                            </div>

                            {/* Step card */}
                            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 hover:border-slate-700 transition-colors duration-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <step.icon className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest">
                                        STEP {step.num}
                                    </span>
                                </div>
                                <h3 className="text-base md:text-lg font-semibold text-white">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {step.desc}
                                </p>
                                <div className="space-y-1.5 pt-1">
                                    {step.details.map((d) => (
                                        <div key={d} className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                            <span className="h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0" />
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
