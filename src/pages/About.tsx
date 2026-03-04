import { Github, Linkedin, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/30 glow-green">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-primary border-2 border-card" />
          </div>

          <div>
            <h2 className="text-xl font-bold font-mono text-foreground">Developer Name</h2>
            <p className="text-sm text-neon-cyan font-mono mt-1">Security Researcher & ML Engineer</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Passionate about the intersection of <span className="text-foreground font-medium">Network Security</span> and{" "}
            <span className="text-foreground font-medium">Machine Learning</span>. Focused on building tools that detect and 
            mitigate AI-generated threats in digital media. Experienced with adversarial ML, 
            computer vision, and building production-grade security pipelines.
          </p>

          <div className="flex items-center gap-3 pt-2">
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

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-mono font-bold text-sm text-foreground mb-4">TECH STACK</h3>
        <div className="flex flex-wrap gap-2">
          {["Python", "scikit-learn", "OpenCV", "FastAPI", "React", "TailwindCSS", "HOG", "Random Forest"].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-md bg-secondary text-xs font-mono text-secondary-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
