/**
 * ProtectedRoute — Route guard that enforces authentication
 *
 * WHY a wrapper component instead of inline checks?
 *   Centralizes auth logic in one place. Any route wrapped with
 *   <ProtectedRoute> automatically redirects unauthenticated users
 *   to /login. This follows the "Single Responsibility Principle" —
 *   page components don't need to know about auth guards.
 *
 * Usage:
 *   <Route path="/" element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    /* While Supabase is checking the session (e.g. on page refresh),
     * show a loading spinner to prevent a flash of the login page. */
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    <p className="text-sm font-mono text-slate-500">Verifying session...</p>
                </div>
            </div>
        );
    }

    /* No session → redirect to login page */
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
