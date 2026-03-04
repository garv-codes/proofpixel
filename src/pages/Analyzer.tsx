import { useState, useCallback } from "react";
import { Upload, ScanEye, AlertTriangle, ShieldCheck, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  label: string;
  confidence: number;
}

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    const valid = ["image/jpeg", "image/jpg", "image/png"];
    if (!valid.includes(f.type)) {
      toast({ title: "Invalid file type", description: "Only .jpg, .jpeg, and .png files are accepted.", variant: "destructive" });
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
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

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
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
      // Mock fallback
      const mock: AnalysisResult = Math.random() > 0.5
        ? { label: "Real", confidence: 87.3 + Math.random() * 10 }
        : { label: "Fake", confidence: 78.5 + Math.random() * 15 };
      setResult(mock);
    } finally {
      setLoading(false);
    }
  };

  const isReal = result?.label === "Real";

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

      {/* Upload / Preview */}
      {!preview ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed border-border rounded-xl p-16 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
        >
          <input type="file" accept=".jpg,.jpeg,.png" onChange={onFileInput} className="absolute inset-0 opacity-0 cursor-pointer" />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
          <p className="mt-4 text-sm font-medium text-foreground">Drop image here or click to upload</p>
          <p className="mt-1 text-xs text-muted-foreground font-mono">.JPG .JPEG .PNG</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-border bg-card">
            <button onClick={clearFile} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
            <img src={preview} alt="Upload preview" className="w-full max-h-[400px] object-contain bg-muted/20" />
            {/* scan overlay when loading */}
            {loading && (
              <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-1 bg-primary/60 animate-scan-line" />
                </div>
              </div>
            )}
          </div>

          <Button
            variant="neon"
            size="lg"
            className="w-full font-mono text-sm"
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Extracting structural artifacts...
              </>
            ) : (
              <>
                <ScanEye className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`rounded-xl border p-8 ${isReal ? "border-glow-green bg-primary/5" : "border-glow-red bg-destructive/5"}`}>
          <div className="flex flex-col items-center gap-6">
            <ConfidenceRing percentage={result.confidence} isReal={isReal} />
            
            <div className="flex items-center gap-3">
              {isReal ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 glow-green">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="font-mono font-bold text-sm text-primary text-glow-green">AUTHENTIC</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/15 border border-destructive/30 glow-red">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <span className="font-mono font-bold text-sm text-destructive text-glow-red">AI-GENERATED</span>
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
    </div>
  );
}
