/**
 * About Page — Developer profile and tech stack showcase
 */

import { Github, Linkedin, Shield, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const techStack = [
    "Python", "scikit-learn", "OpenCV", "FastAPI",
    "React", "TailwindCSS", "HOG", "Gradient Boosting", "Supabase",
];

export default function About() {
    return (
        <div className="max-w-2xl mx-auto">
            {/* ── Profile Card ── */}
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-10 relative overflow-hidden">
                    <div className="flex flex-col items-center text-center space-y-6">
                        {/* Avatar */}
                        <div className="h-28 w-28 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-indigo-500/40">
                            <Shield className="h-12 w-12 text-indigo-400" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">Garv Gujral</h2>
                            <p className="text-base text-zinc-400 mt-1">
                                Security Researcher & ML Engineer
                            </p>
                        </div>

                        <p className="text-base text-zinc-400 leading-relaxed max-w-lg">
                            Focused on the intersection of{" "}
                            <span className="text-white font-medium">Network Security</span> and{" "}
                            <span className="text-white font-medium">Machine Learning</span> to
                            detect and mitigate AI-generated threats in digital media.
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <Button variant="outline" className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 transition-all duration-200" asChild>
                                <a href="https://github.com/garv-codes" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    GitHub
                                </a>
                            </Button>
                            <Button variant="outline" className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 transition-all duration-200" asChild>
                                <a href="https://www.linkedin.com/in/garv-gujral-931a3b246/" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    LinkedIn
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-semibold tracking-widest text-zinc-500 uppercase flex items-center justify-center gap-2">
                        <Cpu className="h-4 w-4 text-indigo-400" />
                        Tech Stack
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {techStack.map((t) => (
                            <span
                                key={t}
                                className="px-4 py-2 rounded-xl bg-zinc-900/80 text-sm text-zinc-300 border border-zinc-800 hover:border-indigo-500/40 hover:text-indigo-400 transition-colors duration-200"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
