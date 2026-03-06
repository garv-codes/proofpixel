/**
 * NotFound Page — 404 error handler
 *
 * Logs the invalid route to console for debugging, then shows
 * a minimal dark-themed 404 message with a link back to the analyzer.
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center space-y-4 animate-fade-in">
                <h1 className="text-6xl font-mono font-bold text-emerald-400 text-glow-green">
                    404
                </h1>
                <p className="text-lg text-slate-400">
                    Oops! Page not found
                </p>
                <a
                    href="/"
                    className="inline-block text-emerald-400 font-mono text-sm underline underline-offset-4 hover:text-emerald-300 transition-colors"
                >
                    Return to Analyzer
                </a>
            </div>
        </div>
    );
};

export default NotFound;
