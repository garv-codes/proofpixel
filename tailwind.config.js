/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
        "./app/**/*.{js,jsx}",
        "./src/**/*.{js,jsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                neon: {
                    green: "hsl(var(--neon-green))",
                    red: "hsl(var(--neon-red))",
                    cyan: "hsl(var(--neon-cyan))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },

            /* ---------------------------------------------------------------
             * Custom Keyframes
             * ---------------------------------------------------------------
             * All animations are defined here in Tailwind config so they can
             * be applied via utility classes (e.g. `animate-scanner`). This
             * avoids raw @keyframes in CSS and keeps the design system
             * centralized.
             * ------------------------------------------------------------- */
            keyframes: {
                /* ShadCN accordion animations (keep for Radix compatibility) */
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },

                /* Scanner — glowing green line that sweeps top→bottom over
                 * the uploaded image. Uses translateY so the GPU handles it
                 * on the compositor thread for 60 fps performance. */
                scanner: {
                    "0%": { transform: "translateY(0%)", opacity: "1" },
                    "100%": { transform: "translateY(2000%)", opacity: "0.3" },
                },

                /* Fade-in for results card entrance */
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },

                /* Slide-up entrance for upload zone CTA */
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },

                /* Pulse-glow for the "SYSTEM ONLINE" indicator dot */
                "pulse-glow": {
                    "0%, 100%": { opacity: "0.4" },
                    "50%": { opacity: "1" },
                },
            },

            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                scanner: "scanner 2.5s ease-in-out infinite",
                "fade-in": "fade-in 0.5s ease-out forwards",
                "slide-up": "slide-up 0.6s ease-out forwards",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
