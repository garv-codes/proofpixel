/**
 * Architecture Page — Technical pipeline documentation
 *
 * Displays the 3-step ML pipeline (Preprocessing → HOG → Random Forest)
 * in a visual timeline layout. Designed for both end-users and technical
 * interviewers to understand the system architecture at a glance.
 */

import { Cpu, ImageDown, BarChart3, TreePine, BookOpen } from "lucide-react";

const glossaryTerms = [
    {
        term: "Grayscaling",
        definition: "Converting a full-color image into black and white to simplify the data (removing raw color noise) so the AI can focus strictly on shapes and textures.",
    },
    {
        term: "Bilinear Interpolation",
        definition: "A math technique used to resize images smoothly by averaging the colors of surrounding pixels, preventing the image from becoming blocky.",
    },
    {
        term: "HOG (Histogram of Oriented Gradients)",
        definition: "A feature extraction technique that counts occurrences of gradient orientation in localized portions of an image. It highlights the 'edges' of objects.",
    },
    {
        term: "Random Forest",
        definition: "A machine learning method that operates by constructing a multitude of decision trees at training time, outputting the class that is the mode of the classes.",
    },
    {
        term: "Aggregation",
        definition: "The process of combining the votes from all the individual decision trees to make a final, highly accurate prediction.",
    },
];

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
        <div className="max-w-6xl mx-auto space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pl-2">

                {/* ── Timeline Column (Centered relative to its space) ── */}
                <div className="lg:col-span-8 relative pl-8 lg:pl-12">
                    {/* Dashed vertical connector line */}
                    <div className="absolute left-3 lg:left-7 top-4 bottom-4 w-px border-l-2 border-dashed border-slate-800" />

                    <div className="space-y-8">
                        {steps.map((step) => (
                            <div key={step.num} className="relative animate-fade-in">
                                {/* Timeline node */}
                                <div className="absolute -left-9 lg:-left-13 top-6 flex items-center justify-center">
                                    <div className="h-6 w-6 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_10px_hsl(160_84%_39%/0.4)]">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                    </div>
                                </div>

                                {/* Step card */}
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-emerald-500/10">
                                            <step.icon className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest">
                                            STEP {step.num}
                                        </span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                                        {step.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {step.details.map((d) => (
                                            <div key={d} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/50 border border-slate-800 text-xs font-mono text-slate-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Glossary Column (Sticky Right) ── */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/60">
                            <BookOpen className="h-5 w-5 text-emerald-400" />
                            <h2 className="text-lg font-mono font-bold text-white tracking-wider">
                                GLOSSARY
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {glossaryTerms.map((item) => (
                                <div key={item.term} className="space-y-1">
                                    <h4 className="text-sm font-bold text-cyan-400 font-mono">{item.term}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {item.definition}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
