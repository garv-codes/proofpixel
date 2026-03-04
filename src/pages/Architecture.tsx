import { Cpu, ImageDown, BarChart3, TreePine, ArrowDown } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Data Preprocessing & Grayscaling",
    icon: ImageDown,
    desc: "Input images are resized to a uniform 128×128 resolution and converted to grayscale. This reduces dimensionality while preserving structural edge information critical for artifact detection.",
    details: ["RGB → Grayscale conversion", "Bilinear interpolation resize", "Pixel normalization (0–255 → 0–1)"],
  },
  {
    num: "02",
    title: "HOG Feature Extraction",
    icon: BarChart3,
    desc: "Histogram of Oriented Gradients (HOG) computes gradient magnitudes and orientations across 8×8 pixel cells. The resulting feature vector captures local texture patterns that differ between real photographs and GAN-generated images.",
    details: ["8×8 pixel cells, 2×2 block normalization", "9 orientation bins (0°–180°)", "Output: 1D feature vector per image"],
  },
  {
    num: "03",
    title: "Random Forest Classification",
    icon: TreePine,
    desc: "An ensemble of 100 decision trees votes on the extracted HOG features. Each tree is trained on a bootstrap sample, and the majority vote determines the final Real/Fake classification with a calibrated confidence score.",
    details: ["100 estimators, max_depth=None", "Bootstrap aggregation (bagging)", "Probability calibration via class margins"],
  },
];

export default function Architecture() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
          <Cpu className="inline h-6 w-6 mr-2 text-neon-cyan" />
          System Architecture
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Technical pipeline for deepfake image detection</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={step.num}>
            <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-neon-cyan font-bold tracking-widest">STEP {step.num}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  <div className="pt-2 space-y-1">
                    {step.details.map((d) => (
                      <div key={d} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
