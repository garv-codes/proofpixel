/**
 * LoginPage — Authentication page with Sign In / Sign Up toggle
 *
 * Design:
 *   Dark-themed card centered on the page with glassmorphism effect.
 *   Uses Supabase Auth for email+password authentication.
 *   Toggle between "Sign In" and "Sign Up" modes within the same card.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogIn, UserPlus, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            if (isSignUp) {
                /* ── Sign Up ─────────────────────────────────────────
                 * Creates a new user in Supabase Auth. By default,
                 * Supabase sends a confirmation email. The user must
                 * verify their email before they can sign in. */
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg("Check your email to confirm your account, then sign in.");
                setIsSignUp(false);
            } else {
                /* ── Sign In ─────────────────────────────────────────
                 * Authenticates with email+password and creates a JWT
                 * session stored in localStorage by the Supabase client. */
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate("/");
            }
        } catch (err) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ── Brand Header ───────────────────────────── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-500/10 glow-green mb-4">
                        <img src="/logo.png" alt="ProofPixel Logo" className="h-12 w-12 object-contain" />
                    </div>
                    <h1 className="text-2xl font-mono font-bold text-white tracking-wider">
                        PROOFPIXEL
                    </h1>
                    <p className="text-sm text-slate-500 font-mono mt-1">
                        AI IMAGE FORENSICS
                    </p>
                </div>

                {/* ── Auth Card ───────────────────────────────── */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        {isSignUp ? (
                            <><UserPlus className="h-5 w-5 text-emerald-400" /> Create Account</>
                        ) : (
                            <><LogIn className="h-5 w-5 text-emerald-400" /> Sign In</>
                        )}
                    </h2>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success message */}
                    {successMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email field */}
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                                    placeholder="agent@proofpixel.ai"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-mono font-semibold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-emerald-500/20"
                        >
                            {loading
                                ? "Processing..."
                                : isSignUp
                                    ? "Create Account"
                                    : "Sign In"
                            }
                        </button>
                    </form>

                    {/* Toggle sign in / sign up */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccessMsg(""); }}
                            className="text-sm text-slate-500 hover:text-emerald-400 transition-colors font-mono"
                        >
                            {isSignUp
                                ? "Already have an account? Sign In"
                                : "Don't have an account? Sign Up"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
