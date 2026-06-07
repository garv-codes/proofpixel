/**
 * Architecture Page — Technical pipeline documentation
 *
 * Displays the 4-step ML pipeline (ELA → FFT → HOG → Gradient Boosting)
 * in a visual timeline layout. Designed for both end-users and technical
 * interviewers to understand the system architecture at a glance.
 */

import { Cpu, Search, Zap, BarChart3, TrendingUp, BookOpen } from "lucide-react";

const glossaryTerms = [
    {
        term: "Error Level Analysis (ELA)",
        definition: "A technique that resaves an image at a known quality level and computes the difference. AI generated or manipulated regions often show different compression patterns than authentic areas.",
    },
    {
        term: "Fast Fourier Transform (FFT)",
        definition: "Converts an image from the spatial domain into the frequency domain. Generative AI models often leave behind unnatural high-frequency artifacts (like checkerboard patterns) that FFT makes visible.",
    },
    {
        term: "HOG (Histogram of Oriented Gradients)",
        definition: "A feature extraction technique that counts occurrences of gradient orientation in localized portions of an image. It highlights the structural 'edges' of objects.",
    },
    {
        term: "Gradient Boosting",
        definition: "A machine learning method that builds an ensemble of weak prediction models (decision trees) sequentially. Each tree corrects the errors of its predecessor, leading to highly accurate classifications.",
    },
    {
        term: "StandardScaler Normalization",
        definition: "Transforms all extracted features (1,804 in total) so they have a mean of zero and standard deviation of one, preventing any single feature scale from dominating the learning process.",
    },
];

const steps = [
    {
        num: "01",
        title: "Error Level Analysis (ELA)",
        icon: Search,
        desc: "Detects inconsistent compression artifacts by computing the difference between the original image and a re-compressed version.",
        details: ["JPEG compression diff", "Artifact mapping"],
    },
    {
        num: "02",
        title: "Frequency Domain Analysis (FFT)",
        icon: Zap,
        desc: "Transforms the image to the frequency domain to identify synthetic periodic noise left by generative adversarial networks (GANs) and diffusion models.",
        details: ["Spatial-to-frequency transform", "High-frequency anomaly detection"],
    },
    {
        num: "03",
        title: "HOG Feature Extraction",
        icon: BarChart3,
        desc: "Computes gradient magnitudes and orientations to capture local structural patterns and edges, ensuring the model understands object boundaries.",
        details: ["8×8 pixel cells", "9 orientation bins"],
    },
    {
        num: "04",
        title: "Gradient Boosting Classification",
        icon: TrendingUp,
        desc: "A Histogram-based Gradient Boosting classifier processes the combined 1,804-dimensional feature vector to determine the final Real/Fake verdict.",
        details: ["500 iterations", "StandardScaler normalization", "1,804 features"],
    },
];

export default function Architecture() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                    System Architecture
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                    Technical pipeline for deepfake image detection.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pl-0 md:pl-2">

                {/* Timeline Column */}
                <div className="lg:col-span-8 relative pl-6 md:pl-8 lg:pl-12">
                    {/* Dashed vertical connector line */}
                    <div className="absolute left-1 md:left-3 lg:left-7 top-4 bottom-4 w-px border-l-2 border-dashed border-zinc-800" />

                    <div className="space-y-8">
                        {steps.map((step) => (
                            <div key={step.num} className="relative">
                                {/* Timeline node */}
                                <div className="absolute -left-7 md:-left-9 lg:-left-13 top-6 flex items-center justify-center">
                                    <div className="h-6 w-6 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                                    </div>
                                </div>

                                {/* Step card */}
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4 hover:border-zinc-700 hover:bg-zinc-800/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-indigo-500/10">
                                            <step.icon className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">
                                            Step {step.num}
                                        </span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-semibold text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                                        {step.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {step.details.map((d) => (
                                            <div key={d} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950/50 border border-zinc-800 text-xs text-zinc-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Glossary Column */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
                            <BookOpen className="h-5 w-5 text-indigo-400" />
                            <h2 className="text-lg font-bold text-white tracking-wider uppercase">
                                Glossary
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {glossaryTerms.map((item) => (
                                <div key={item.term} className="space-y-1">
                                    <h4 className="text-sm font-semibold text-zinc-200">{item.term}</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
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
