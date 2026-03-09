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
            <nav className="w-full relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="ProofPixel Logo" className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-transform hover:scale-110" />
                    <span className="font-mono text-2xl font-bold tracking-tight">ProofPixel</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white font-mono hover:bg-slate-800/50">
                            Log In
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono px-6">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-20 pb-32 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-mono mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Zap className="h-4 w-4" />
                    <span>Next-Gen ML Pipeline Active</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                    Detect AI-Generated <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                        Media Instantly
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                    Upload any image and let our advanced multi-feature forensic engine analyze compression artifacts, frequency spectrums, and texture patterns to determine its authenticity.
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

            {/* Value Proposition Grid */}
            <section className="border-t border-slate-800/50 bg-slate-900/30 relative z-10 py-24 px-6 relative overflow-hidden">
                {/* Subtle bottom radial glow */}
                <div className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
                    <FeatureCard
                        icon={<Shield className="h-8 w-8 text-emerald-400" />}
                        title="High Accuracy ML"
                        description="Powered by a state-of-the-art Random Forest model trained on over 30,000 deepfakes and authentic photos."
                        delay="delay-100"
                    />
                    <FeatureCard
                        icon={<Search className="h-8 w-8 text-teal-400" />}
                        title="Deep Analysis"
                        description="Uses Error Level Analysis (ELA) and Fast Fourier Transforms (FFT) to spot invisible digital manipulations."
                        delay="delay-200"
                    />
                    <FeatureCard
                        icon={<Zap className="h-8 w-8 text-cyan-400" />}
                        title="Lightning Fast"
                        description="Get decisive probability scores and visual forensic breakdowns in mere milliseconds. No waiting required."
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
