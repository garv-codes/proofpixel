/**
 * About Page — Developer profile and tech stack showcase
 */

import { Github, Linkedin, Shield, Milestone, CheckCircle2, CircleDashed, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const techStack = [
    "Python", "scikit-learn", "OpenCV", "FastAPI",
    "React", "TailwindCSS", "HOG", "Gradient Boosting", "Supabase",
];

export default function About() {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* ── Left Column: Profile Card ── */}
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-8 relative overflow-hidden">
                    <div className="flex flex-col items-center text-center space-y-5">
                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-indigo-500/40">
                            <Shield className="h-10 w-10 text-indigo-400" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white">Garv Gujral</h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                Security Researcher & ML Engineer
                            </p>
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Focused on the intersection of{" "}
                            <span className="text-white font-medium">Network Security</span> and{" "}
                            <span className="text-white font-medium">Machine Learning</span> to
                            detect and mitigate AI-generated threats in digital media.
                        </p>

                        <div className="flex items-center gap-3 pt-1">
                            <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 transition-all duration-200" asChild>
                                <a href="https://github.com/garv-codes" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    GitHub
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 transition-all duration-200" asChild>
                                <a href="https://www.linkedin.com/in/garv-gujral-931a3b246/" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    LinkedIn
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase flex items-center gap-2">
                        <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                        Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {techStack.map((t) => (
                            <span
                                key={t}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900/80 text-xs text-zinc-300 border border-zinc-800 hover:border-indigo-500/40 hover:text-indigo-400 transition-colors duration-200"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Column: Project Roadmap ── */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 md:p-8">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-zinc-800/50">
                    <Milestone className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white tracking-wider uppercase">
                        Project Roadmap
                    </h2>
                </div>

                <div className="relative pl-6 space-y-8">
                    {/* Vertical tracking line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-zinc-800" />

                    {/* Milestone 1 (Completed) */}
                    <div className="relative">
                        <CheckCircle2 className="absolute -left-[30px] top-0.5 h-6 w-6 text-indigo-500 bg-zinc-950 rounded-full" />
                        <div>
                            <h3 className="text-zinc-200 font-bold">MVP Release</h3>
                            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                                Launched core visual analyzer with ELA and FFT map generation, supported by a baseline Random Forest classifier.
                            </p>
                        </div>
                    </div>

                    {/* Milestone 2 (Completed) */}
                    <div className="relative">
                        <CheckCircle2 className="absolute -left-[30px] top-0.5 h-6 w-6 text-indigo-500 bg-zinc-950 rounded-full" />
                        <div>
                            <h3 className="text-zinc-200 font-bold">Industry Benchmark Accuracy</h3>
                            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                                Upgraded backend to a Histogram-based Gradient Boosting classifier with StandardScaler normalization, achieving over 93% accuracy on a dataset of 120,000 images.
                            </p>
                        </div>
                    </div>

                    {/* Milestone 3 (Completed) */}
                    <div className="relative">
                        <CheckCircle2 className="absolute -left-[30px] top-0.5 h-6 w-6 text-indigo-500 bg-zinc-950 rounded-full" />
                        <div>
                            <h3 className="text-zinc-200 font-bold">UX Overhaul & Auth</h3>
                            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                                Integrated Supabase authentication and implemented a clean, professional Zinc/Indigo design system to remove the "vibe-coded" feel and deliver an enterprise-grade experience.
                            </p>
                        </div>
                    </div>

                    {/* Milestone 4 (Planned) */}
                    <div className="relative opacity-60">
                        <div className="absolute -left-[27px] top-1.5 h-4 w-4 rounded-full border-2 border-zinc-600 bg-zinc-950" />
                        <div>
                            <h3 className="text-zinc-400 font-bold">Deep Learning Model</h3>
                            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                                Upgrade backend to a hybrid CNN (Convolutional Neural Network) architecture for ~98% zero-day detection accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
