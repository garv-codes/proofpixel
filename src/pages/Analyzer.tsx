import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, ScanEye, AlertTriangle, ShieldCheck, ShieldAlert, X, Camera, ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  label: string;
  confidence: number;
}

const SCAN_STEPS = [
  "Converting to grayscale...",
  "Applying Gaussian blur...",
  "Extracting HOG features...",
  "Computing gradient orientations...",
  "Building feature vector...",
  "Running Random Forest classifier...",
  "Aggregating decision trees...",
  "Calculating confidence score...",
];

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cycle scan steps while loading
  useEffect(() => {
    if (!loading) return;
    setScanStep(0);
    const interval = setInterval(() => {
      setScanStep((s) => (s + 1) % SCAN_STEPS.length);
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFile = useCallback((f: File) => {
    const valid = ["image/jpeg", "image/jpg", "image/png"];
    if (!valid.includes(f.type)) {
      toast({ title: "Invalid file type", description: "Only .jpg, .jpeg, and .png files are accepted.", variant: "destructive" });
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      // Auto-run analysis on mobile after selection
      setTimeout(() => runAnalysisWithFile(f), 300);
    };
    reader.readAsDataURL(f);
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const runAnalysisWithFile = async (targetFile: File) => {
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", targetFile);
      const res = await fetch("http://localhost:8000/predict", { method: "POST", body: formData });
      if (!res.ok) throw new Error("API error");
      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch {
      toast({
        title: "Backend Offline",
        description: "Could not reach the API. Showing mock result for UI testing.",
        variant: "destructive",
      });
      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 2400));
      const mock: AnalysisResult = Math.random() > 0.5
        ? { label: "Real", confidence: 87.3 + Math.random() * 10 }
        : { label: "Fake", confidence: 78.5 + Math.random() * 15 };
      setResult(mock);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = () => {
    if (!file) return;
    runAnalysisWithFile(file);
  };

  const isReal = result?.label === "Real";

  // === IDLE STATE: No image selected ===
  if (!preview) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            <ScanEye className="inline h-6 w-6 mr-2 text-primary" />
            Image Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Upload an image to detect AI-generated artifacts</p>
        </div>

        {/* Desktop: drag-and-drop */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="hidden md:block relative border-2 border-dashed border-border rounded-xl p-16 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
        >
          <input type="file" accept=".jpg,.jpeg,.png" onChange={onFileInput} className="absolute inset-0 opacity-0 cursor-pointer" />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
          <p className="mt-4 text-sm font-medium text-foreground">Drop image here or click to upload</p>
          <p className="mt-1 text-xs text-muted-foreground font-mono">.JPG .JPEG .PNG</p>
        </div>

        {/* Mobile: Take Photo / Choose Gallery buttons */}
        <div className="flex flex-col gap-3 md:hidden">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            onChange={onFileInput}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={onFileInput}
            className="hidden"
          />
          <Button
            variant="neon"
            size="lg"
            className="w-full min-h-[52px] text-base font-mono"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 mr-2" />
            Take Photo
          </Button>
          <Button
            variant="neon-outline"
            size="lg"
            className="w-full min-h-[52px] text-base font-mono"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5 mr-2" />
            Choose from Gallery
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground font-mono">
          Supported: .JPG .JPEG .PNG
        </p>
      </div>
    );
  }

  // === SCANNING / RESULTS STATE ===
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Image preview */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-card">
        <button onClick={clearFile} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
        <div className={`relative ${result ? "opacity-60" : ""} transition-opacity duration-500`}>
          <img src={preview} alt="Upload preview" className="w-full max-h-[350px] md:max-h-[400px] object-contain bg-muted/20" />
          {/* Scan line overlay */}
          {loading && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="w-full h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary)),0_0_40px_hsl(var(--primary))] animate-scan-line" />
            </div>
          )}
        </div>
      </div>

      {/* Scanning text */}
      {loading && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            <p className="text-sm font-mono text-primary text-glow-green animate-pulse">{SCAN_STEPS[scanStep]}</p>
          </div>
        </div>
      )}

      {/* Desktop: manual run button (only if no result and not loading) */}
      {!result && !loading && (
        <Button
          variant="neon"
          size="lg"
          className="w-full font-mono text-sm hidden md:flex"
          onClick={runAnalysis}
          disabled={loading}
        >
          <ScanEye className="h-4 w-4 mr-2" />
          Run AI Analysis
        </Button>
      )}

      {/* Results */}
      {result && (
        <div className={`rounded-xl border p-6 md:p-8 ${isReal ? "border-glow-green bg-primary/5" : "border-glow-red bg-destructive/5"} animate-fade-in`}>
          <div className="flex flex-col items-center gap-5">
            {/* Mobile: large percentage text */}
            <div className="md:hidden text-center">
              <span className={`text-7xl font-mono font-black tracking-tighter ${isReal ? "text-primary text-glow-green" : "text-destructive text-glow-red"}`}>
                {result.confidence.toFixed(0)}%
              </span>
              <p className="text-xs text-muted-foreground font-mono mt-1">CONFIDENCE</p>
            </div>

            {/* Desktop: confidence ring */}
            <div className="hidden md:block">
              <ConfidenceRing percentage={result.confidence} isReal={isReal} />
            </div>

            <div className="flex items-center gap-3">
              {isReal ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/30 glow-green">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="font-mono font-bold text-sm text-primary text-glow-green">AUTHENTIC</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive/15 border border-destructive/30 glow-red">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <span className="font-mono font-bold text-sm text-destructive text-glow-red">AI GENERATED</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <AlertTriangle className="h-3 w-3" />
              Analysis is probabilistic — verify with additional methods
            </div>
          </div>
        </div>
      )}

      {/* New Scan button */}
      {result && (
        <Button
          variant="neon-outline"
          size="lg"
          className="w-full font-mono text-sm min-h-[48px]"
          onClick={clearFile}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Scan
        </Button>
      )}
    </div>
  );
}
