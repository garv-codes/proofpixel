/**
 * Supabase Client — Singleton instance for frontend auth and data access
 *
 * WHY a singleton?
 *   Creating multiple Supabase clients would open multiple WebSocket
 *   connections for realtime subscriptions, wasting resources and causing
 *   race conditions in auth state management.
 *
 * Environment Variables (set in .env or Vercel dashboard):
 *   VITE_SUPABASE_URL      — Your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Your Supabase anonymous (public) API key
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. " +
        "Authentication will not work."
    );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
