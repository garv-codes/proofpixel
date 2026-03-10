/**
 * About Page — Developer profile and tech stack showcase
 */

import { Github, Linkedin, Shield, Milestone, CheckCircle2, CircleDashed, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const techStack = [
    "Python", "scikit-learn", "OpenCV", "FastAPI",
    "React", "TailwindCSS", "HOG", "Random Forest", "Supabase",
];

export default function About() {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* ── Left Column: Profile Card ── */}
            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl relative overflow-hidden">
                    {/* Subtle glow effect behind avatar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="flex flex-col items-center text-center space-y-5">
                        {/* Avatar placeholder with emerald ring */}
                        <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                            <Shield className="h-10 w-10 text-emerald-400" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold font-mono text-white">Garv Gujral</h2>
                            <p className="text-sm text-cyan-400 font-mono mt-1">
                                Security Researcher & ML Engineer
                            </p>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed">
                            Focused on the intersection of{" "}
                            <span className="text-white font-medium">Network Security</span> and{" "}
                            <span className="text-white font-medium">Machine Learning</span> to
                            detect and mitigate AI-generated threats in digital media.
                        </p>

                        <div className="flex items-center gap-3 pt-1">
                            <Button variant="neon-outline" size="sm" className="hover:scale-105 transition-all duration-200" asChild>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    GitHub
                                </a>
                            </Button>
                            <Button variant="neon-outline" size="sm" className="hover:scale-105 transition-all duration-200" asChild>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    LinkedIn
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-3 pt-2">
                    <h3 className="font-mono text-xs tracking-widest text-slate-500 uppercase flex items-center gap-2">
                        <Cpu className="h-3.5 w-3.5 text-cyan-500" />
                        Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {techStack.map((t) => (
                            <span
                                key={t}
                                className="px-3 py-1.5 rounded-lg bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors duration-200"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Column: Project Roadmap ── */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-800/50">
                    <Milestone className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-mono font-bold text-white tracking-wider">
                        PROJECT ROADMAP
                    </h2>
                </div>

                <div className="relative pl-6 space-y-8">
                    {/* Vertical tracking line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-800" />

                    {/* Milestone 1 (Completed) */}
                    <div className="relative">
                        <CheckCircle2 className="absolute -left-[30px] top-0.5 h-6 w-6 text-emerald-500 bg-slate-950 rounded-full" />
                        <div>
                            <h3 className="text-slate-200 font-bold font-mono">MVP Release</h3>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                Launched core Random Forest analyzer with HOG feature extraction and Grayscale normalization.
                            </p>
                        </div>
                    </div>

                    {/* Milestone 2 (Completed) */}
                    <div className="relative">
                        <CheckCircle2 className="absolute -left-[30px] top-0.5 h-6 w-6 text-emerald-500 bg-slate-950 rounded-full" />
                        <div>
                            <h3 className="text-slate-200 font-bold font-mono">Explainable AI (XAI)</h3>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                Integrated Error Level Analysis (ELA) and Fast Fourier Transform (FFT) visual map generation into the scanning pipeline.
                            </p>
                        </div>
                    </div>

                    {/* Milestone 3 (In Progress) */}
                    <div className="relative">
                        <CircleDashed className="absolute -left-[30px] top-0.5 h-6 w-6 text-cyan-400 bg-slate-950 rounded-full animate-[spin_4s_linear_infinite]" />
                        <div>
                            <h3 className="text-cyan-400 font-bold font-mono">UX Overhaul & Auth</h3>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                Hardening Supabase authentication, polishing glassmorphism UI, expanding the dashboard, and optimizing the React Router flow.
                            </p>
                        </div>
                    </div>

                    {/* Milestone 4 (Planned) */}
                    <div className="relative opacity-60">
                        <div className="absolute -left-[27px] top-1.5 h-4 w-4 rounded-full border-2 border-slate-600 bg-slate-950" />
                        <div>
                            <h3 className="text-slate-400 font-bold font-mono">Deep Learning Model</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                Upgrade backend to a hybrid CNN (Convolutional Neural Network) architecture for ~98% zero-day detection accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
