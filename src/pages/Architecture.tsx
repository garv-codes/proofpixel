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
    desc: "An ensemble of 100 decision trees votes on extracted HOG features. Majority vote determines the final Real/Fake classification.",
    details: ["100 estimators", "Bootstrap aggregation", "Probability calibration"],
  },
];

export default function Architecture() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
          <Cpu className="h-5 w-5 text-neon-cyan" />
          System Architecture
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Technical pipeline for deepfake image detection.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Dashed vertical line */}
        <div className="absolute left-3 top-3 bottom-3 w-px border-l-2 border-dashed border-border" />

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              {/* Timeline node */}
              <div className="absolute -left-8 top-6 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-[0_0_10px_hsl(var(--neon-green)/0.4)]">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              </div>

              {/* Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-mono text-xs text-neon-cyan font-bold tracking-widest">
                    STEP {step.num}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                <div className="space-y-1.5 pt-1">
                  {step.details.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
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
