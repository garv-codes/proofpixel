/**
 * App — Root application shell and routing configuration
 *
 * ARCHITECTURE OVERVIEW:
 * ─────────────────────────────────────────────────────────────────
 * Provider Hierarchy (outermost → innermost):
 *   1. QueryClientProvider — TanStack Query for async state management
 *   2. AuthProvider        — Supabase auth session context
 *   3. TooltipProvider     — Radix UI tooltip context
 *   4. BrowserRouter       — React Router v6 client-side routing
 *
 * Route Protection:
 *   /              → Protected (requires auth) → Analyzer
 *   /login         → Public → LoginPage
 *   /architecture  → Protected → Architecture docs
 *   /about         → Protected → Developer profile
 *   *              → 404 Not Found
 * ─────────────────────────────────────────────────────────────────
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import Analyzer from "./pages/Analyzer";
import Architecture from "./pages/Architecture";
import About from "./pages/About";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />

                <BrowserRouter>
                    <Routes>
                        {/* Public route — login page & landing page (no sidebar/nav) */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected routes — wrapped in the app shell layout */}
                        <Route
                            path="*"
                            element={
                                <ProtectedRoute>
                                    <div className="flex min-h-screen w-full bg-slate-950">
                                        <div className="hidden md:block">
                                            <AppSidebar />
                                        </div>
                                        <div className="flex-1 flex flex-col min-h-screen">
                                            <TopBar />
                                            <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
                                                <Routes>
                                                    <Route path="/dashboard" element={<Analyzer />} />
                                                    <Route path="/architecture" element={<Architecture />} />
                                                    <Route path="/about" element={<About />} />
                                                    <Route path="*" element={<NotFound />} />
                                                </Routes>
                                            </main>
                                        </div>
                                        <BottomNav />
                                    </div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
