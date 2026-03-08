/**
 * HistoryPanel — Recent scans sidebar for the Analyzer page
 *
 * ARCHITECTURE:
 *   Fetches the authenticated user's scan history from the FastAPI backend
 *   and displays compact cards with verdict badges and relative timestamps.
 *
 *   The `refreshKey` prop (incremented after each scan) triggers a re-fetch
 *   via the useEffect dependency, keeping the panel in sync without polling.
 *
 * Props:
 *   @param {string} userId    — Supabase user UUID for scoping queries
 *   @param {number} refreshKey — Counter that triggers re-fetch on change
 */

import { useState, useEffect } from "react";
import { Clock, Shield, AlertTriangle, History, Trash2, Loader2 } from "lucide-react";
import { fetchRecentScans, clearRecentScans } from "@/services/api";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Converts an ISO timestamp to a human-friendly relative time string.
 * e.g. "2 hours ago", "3 days ago", "Just now"
 */
function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export function HistoryPanel({ userId, refreshKey }) {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetchRecentScans(userId)
            .then(setScans)
            .finally(() => setLoading(false));
    }, [userId, refreshKey]);

    const handleClearHistory = async () => {
        if (!userId) return;
        setClearing(true);
        try {
            const success = await clearRecentScans(userId);
            if (success) {
                setScans([]);
                toast.success("Scan history cleared successfully.");
            } else {
                toast.error("Failed to clear scan history.");
            }
        } catch (error) {
            toast.error("An error occurred while clearing history.");
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-5 h-fit">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-mono font-bold text-white tracking-wider">
                        RECENT SCANS
                    </h2>
                </div>

                {/* Clear All Button & Modal */}
                {scans.length > 0 && !loading && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                disabled={clearing}
                                className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors focus:outline-none disabled:opacity-50"
                            >
                                {clearing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                                <span>Clear All</span>
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-mono text-white">Clear Scan History?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400 leading-relaxed">
                                    Are you sure you want to delete your entire scan history? This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800 hover:text-slate-200 focus:ring-slate-700">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleClearHistory}
                                    className="bg-rose-500 hover:bg-rose-600 text-white font-mono"
                                >
                                    Delete All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                </div>
            )}

            {/* Empty state */}
            {!loading && scans.length === 0 && (
                <div className="text-center py-8">
                    <Shield className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-mono">No scans yet</p>
                    <p className="text-[10px] text-slate-700 mt-1">
                        Upload an image to start
                    </p>
                </div>
            )}

            {/* Scan history list */}
            {!loading && scans.length > 0 && (
                <div className="space-y-2">
                    {scans.map((scan) => {
                        const isAI = scan.verdict === "Fake";
                        return (
                            <div
                                key={scan.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors duration-200"
                            >
                                {/* Thumbnail placeholder — hash-based color */}
                                <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-xs font-mono ${isAI
                                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                    }`}>
                                    {isAI
                                        ? <AlertTriangle className="h-4 w-4" />
                                        : <Shield className="h-4 w-4" />
                                    }
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {/* Verdict badge */}
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isAI
                                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                            }`}>
                                            {isAI ? "AI" : "REAL"}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-600">
                                            {scan.ai_probability.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="h-2.5 w-2.5 text-slate-600" />
                                        <span className="text-[10px] text-slate-600 font-mono">
                                            {timeAgo(scan.created_at)}
                                        </span>
                                        <span className="text-[10px] text-slate-700 font-mono ml-1">
                                            {scan.processing_time_ms}ms
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
