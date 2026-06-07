/**
 * LoginPage — Authentication page with Sign In / Sign Up toggle
 *
 * Clean card centered on dark background.
 * Uses Supabase Auth for email+password authentication.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, AlertCircle, ScanEye } from "lucide-react";
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
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg("Check your email to confirm your account, then sign in.");
                setIsSignUp(false);
            } else {
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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 mb-4">
                        <ScanEye className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        ProofPixel
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Image Forensics
                    </p>
                </div>

                {/* Auth Card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        {isSignUp ? (
                            <><UserPlus className="h-5 w-5 text-indigo-400" /> Create Account</>
                        ) : (
                            <><LogIn className="h-5 w-5 text-indigo-400" /> Sign In</>
                        )}
                    </h2>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success message */}
                    {successMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email field */}
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider font-medium">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Signing in..."
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
                            className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
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
