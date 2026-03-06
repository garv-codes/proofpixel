import { Github, Linkedin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const techStack = [
    "Python", "scikit-learn", "OpenCV", "FastAPI",
    "React", "TailwindCSS", "HOG", "Random Forest", "Supabase",
];

export default function About() {
    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex flex-col items-center text-center space-y-5">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/40 shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                        <Shield className="h-10 w-10 text-primary" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold font-mono text-foreground">Garv Gujral</h2>
                        <p className="text-sm text-neon-cyan font-mono mt-1">Security Researcher & ML Engineer</p>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Focused on the intersection of <span className="text-foreground font-medium">Network Security</span> and{" "}
                        <span className="text-foreground font-medium">Machine Learning</span> to detect and mitigate AI-generated threats in digital media.
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                        <Button variant="neon-outline" size="sm" asChild>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-2" />
                                GitHub
                            </a>
                        </Button>
                        <Button variant="neon-outline" size="sm" asChild>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-3">
                <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                    {techStack.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-full bg-secondary text-xs font-mono text-secondary-foreground">
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
