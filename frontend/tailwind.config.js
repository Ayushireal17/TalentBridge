/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        tb: {
          primary:   "#e11d48",
          secondary: "#f97316",
          accent:    "#eab308",
          dark:      "#0f0a0a",
          card:      "#1a0f0f",
          border:    "#ffffff12",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "float":      "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow":  "spin 8s linear infinite",
        "gradient":   "gradient 4s ease infinite",
        "slide-up":   "slideUp 0.5s ease-out",
        "fade-in":    "fadeIn 0.4s ease-out",
      },
      keyframes: {
        float:   { "0%,100%": { transform: "translateY(0)" },       "50%": { transform: "translateY(-10px)" } },
        gradient:{ "0%,100%": { backgroundPosition: "0% 50%" },     "50%": { backgroundPosition: "100% 50%" } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:  { from: { opacity: 0 },                             to:   { opacity: 1 } },
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
      boxShadow: {
        "glow-rose":   "0 0 40px #e11d4844",
        "glow-orange": "0 0 40px #f9731644",
        "glow-gold":   "0 0 40px #eab30844",
      },
      borderColor: {
        DEFAULT: "#ffffff12",
      },
      backgroundColor: {
        "tb-dark": "#0f0a0a",
        "tb-card": "#1a0f0f",
      },
    },
  },
  plugins: [],
};