import { Shield, Zap, Search, ArrowRight } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (session) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Navbar */}
            <nav className="w-full relative z-10 px-4 md:px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-tight text-white">🛡️ ProofPixel</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white font-mono hover:bg-slate-800/50 min-h-[44px]">
                            Log In
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono px-6 min-h-[44px]">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-20 pb-32 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-mono mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-wrap justify-center text-center">
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>ELA + FFT + HOG → Random Forest Classifier</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                    Detect AI-Generated <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                        Media Instantly
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                    Upload any image. ProofPixel checks compression artifacts (ELA), frequency patterns (FFT), and structural edges (HOG), then runs a Random Forest classifier to determine if it's real or AI-generated.
                </p>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                    <Link to="/login">
                        <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg px-8 h-14 rounded-full shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.7)] transition-all hover:scale-105">
                            Start Analyzing Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </main>

            {/* How It Works — 4-step pipeline breakdown */}
            <section className="border-t border-slate-800/50 relative z-10 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-mono font-bold text-slate-500 tracking-widest uppercase mb-12 text-center">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                        <div className="space-y-3">
                            <span className="text-3xl font-mono font-black text-emerald-500/60">01</span>
                            <h3 className="text-base font-bold text-white font-mono">Upload</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Drop any image. JPEG and PNG supported. The file never leaves your browser until analysis begins.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <span className="text-3xl font-mono font-black text-emerald-500/60">02</span>
                            <h3 className="text-base font-bold text-white font-mono">Feature Extraction</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                ProofPixel extracts 1,804 features: Error Level Analysis (ELA) detects re-saved compression artifacts, FFT reveals frequency anomalies introduced by generative models, and HOG captures structural edge patterns.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <span className="text-3xl font-mono font-black text-emerald-500/60">03</span>
                            <h3 className="text-base font-bold text-white font-mono">Classification</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                A Random Forest classifier trained on real and AI-generated image pairs votes across 200 decision trees to produce a confidence score.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <span className="text-3xl font-mono font-black text-emerald-500/60">04</span>
                            <h3 className="text-base font-bold text-white font-mono">Verdict</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                You get a clear Real / Fake label with a confidence percentage. No black box — the feature breakdown is shown so you can see what triggered the result.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Limitations — honest accuracy caveats */}
            <section className="relative z-10 py-16 px-6">
                <div className="max-w-3xl mx-auto rounded-xl border border-slate-800 bg-slate-800/30 p-5 md:p-8">
                    <h2 className="text-sm font-mono font-bold text-slate-400 tracking-widest uppercase mb-6">
                        What ProofPixel doesn't do well
                    </h2>
                    <ul className="space-y-4 text-sm text-slate-400 leading-relaxed">
                        <li>
                            Works best on original, high-resolution images. Upscaled or low-resolution images destroy the compression artifacts ELA relies on, reducing accuracy.
                        </li>
                        <li>
                            Screenshots of AI images fool the detector — the screenshot re-compression masks the original generation artifacts.
                        </li>
                        <li>
                            Not a courtroom tool. Treat results as a strong signal, not proof.
                        </li>
                    </ul>
                </div>
            </section>

            {/* Value Proposition Grid */}
            <section className="border-t border-slate-800/50 bg-slate-900/30 relative z-10 py-24 px-6 relative overflow-hidden">
                {/* Subtle bottom radial glow */}
                <div className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
                    <FeatureCard
                        icon={<Shield className="h-8 w-8 text-emerald-400" />}
                        title="High Accuracy ML"
                        description="Random Forest classifier with 200 decision trees, trained on 30,000+ real and AI-generated image pairs."
                        delay="delay-100"
                    />
                    <FeatureCard
                        icon={<Search className="h-8 w-8 text-teal-400" />}
                        title="Multi-Feature Extraction"
                        description="Extracts 1,804 features via Error Level Analysis (ELA), Fast Fourier Transforms (FFT), and Histogram of Oriented Gradients (HOG)."
                        delay="delay-200"
                    />
                    <FeatureCard
                        icon={<Zap className="h-8 w-8 text-cyan-400" />}
                        title="Lightning Fast"
                        description="Get a Real/Fake verdict with a confidence percentage and visual ELA + FFT breakdowns in under a second."
                        delay="delay-300"
                    />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }) {
    return (
        <div className={`flex flex-col items-center text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${delay}`}>
            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3 font-mono">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}
