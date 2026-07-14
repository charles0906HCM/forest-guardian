/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          deep: "#2D5F3F",
          mid: "#3D7B52",
          light: "#7FB069",
          mist: "#A8C8B0",
          fog: "#F4F7F5",
          bark: "#8B6F47",
          moss: "#5C8C56",
        },
        sun: {
          gold: "#F4B942",
          light: "#FFD166",
        },
        berry: {
          red: "#E76F51",
          orange: "#F4A261",
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', "system-ui", "sans-serif"],
        body: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(45, 95, 63, 0.12)",
        "glass-lg": "0 12px 40px rgba(45, 95, 63, 0.18)",
        "inner-glow": "inset 0 1px 1px rgba(255,255,255,0.5)",
      },
      backdropBlur: {
        xs: "2px",
        "4xl": "40px",
      },
      animation: {
        "leaf-fall": "leafFall 12s linear infinite",
        "sun-shimmer": "sunShimmer 6s ease-in-out infinite",
        "coin-drop": "coinDrop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "breathe": "breathe 4s ease-in-out infinite",
        "float-soft": "floatSoft 5s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        leafFall: {
          "0%": { transform: "translateY(-10vh) translateX(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.8" },
          "100%": { transform: "translateY(110vh) translateX(80px) rotate(360deg)", opacity: "0" },
        },
        sunShimmer: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        coinDrop: {
          "0%": { transform: "translateY(-40px) scale(0.5)", opacity: "0" },
          "60%": { transform: "translateY(8px) scale(1.1)", opacity: "1" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
