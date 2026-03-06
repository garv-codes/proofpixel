/**
 * AuthContext — Global authentication state provider
 *
 * ARCHITECTURE:
 *   Uses React Context + Supabase's `onAuthStateChange` listener to keep
 *   the user/session in sync across the entire component tree. This means
 *   any component can call `useAuth()` to get the current user without
 *   prop-drilling.
 *
 * WHY onAuthStateChange instead of polling?
 *   Supabase pushes auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
 *   in real-time via its GoTrue client. This is more efficient and
 *   responsive than periodic polling.
 *
 * Exports:
 *   - AuthProvider  — Wrap your app with this component
 *   - useAuth()     — Hook returning { user, session, loading, signOut }
 */

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /* ── Initial session check ──────────────────────────────────
         * On mount, fetch the current session from Supabase's local
         * storage. This handles page refreshes — the user stays logged
         * in because Supabase persists the JWT in localStorage. */
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        /* ── Real-time auth listener ────────────────────────────────
         * Fires on every auth state change: sign-in, sign-out, token
         * refresh, etc. The returned `subscription` is cleaned up on
         * unmount to prevent memory leaks. */
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access the auth context.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return context;
}
