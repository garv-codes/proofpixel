/**
 * App — Root application shell and routing configuration
 *
 * ARCHITECTURE OVERVIEW:
 * ─────────────────────────────────────────────────────────────────
 * Provider Hierarchy (outermost → innermost):
 *   1. QueryClientProvider — TanStack Query for async state management
 *   2. TooltipProvider     — Radix UI tooltip context
 *   3. BrowserRouter       — React Router v6 client-side routing
 *
 * Layout Strategy (responsive):
 *   ┌─────────────────────────────────────────────────┐
 *   │ Desktop (md:+)     │  Mobile (<md)              │
 *   │ ┌────────┬────────┐│  ┌──────────────────┐      │
 *   │ │Sidebar │ Main   ││  │ TopBar           │      │
 *   │ │(fixed) │Content ││  │ Main Content     │      │
 *   │ │        │        ││  │ BottomNav (fixed) │      │
 *   │ └────────┴────────┘│  └──────────────────┘      │
 *   └─────────────────────────────────────────────────┘
 *
 * Routes:
 *   /              → Analyzer (image upload + forensic analysis)
 *   /architecture  → System architecture documentation
 *   /about         → Developer profile
 *   *              → 404 Not Found
 * ─────────────────────────────────────────────────────────────────
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import Analyzer from "./pages/Analyzer";
import Architecture from "./pages/Architecture";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

/* Create a single QueryClient instance outside the component to prevent
 * re-instantiation on every render, which would clear the cache. */
const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            {/* Toast notification systems */}
            <Toaster />
            <Sonner />

            <BrowserRouter>
                <div className="flex min-h-screen w-full bg-slate-950">
                    {/* Desktop sidebar — hidden below md breakpoint */}
                    <div className="hidden md:block">
                        <AppSidebar />
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 flex flex-col min-h-screen">
                        {/* Mobile header — visible only below md breakpoint */}
                        <TopBar />

                        <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
                            <Routes>
                                <Route path="/" element={<Analyzer />} />
                                <Route path="/architecture" element={<Architecture />} />
                                <Route path="/about" element={<About />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                    </div>

                    {/* Mobile bottom navigation — hidden on md+ */}
                    <BottomNav />
                </div>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
