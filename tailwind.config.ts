import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import { type PluginAPI } from "tailwindcss/types/config";

// Définition d'un type non circulaire pour les couleurs
interface ColorValue {
  [key: string]: string | ColorValue;
}

function flattenColorPalette(colors: ColorValue) {
  const result: Record<string, string> = {};

  // Fonction pour aplatir les palettes de couleurs imbriquées
  function flattenColors(colorObj: ColorValue, prefix = "") {
    for (const key in colorObj) {
      const value = colorObj[key];
      if (typeof value === "string") {
        result[prefix + key] = value;
      } else {
        flattenColors(value, `${prefix}${key}-`);
      }
    }
  }

  flattenColors(colors);
  return result;
}

function addVariablesForColors({ addBase, theme }: PluginAPI) {
  const allColors = flattenColorPalette(theme("colors") as ColorValue);
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      mobile: "760px",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "foreground-primary-50": "hsl(var(--foreground-50))",
        "foreground-primary-100": "hsl(var(--foreground-100))",
        "foreground-primary-200": "hsl(var(--foreground-200))",
        "foreground-primary-300": "hsl(var(--foreground-300))",
        "foreground-primary-400": "hsl(var(--foreground-400))",
        "foreground-primary-500": "hsl(var(--foreground-500))",
        "foreground-primary-600": "hsl(var(--foreground-600))",
        "foreground-primary-700": "hsl(var(--foreground-700))",
        "foreground-primary-800": "hsl(var(--foreground-800))",
        "foreground-primary-900": "hsl(var(--foreground-900))",
        "foreground-primary-950": "hsl(var(--foreground-950))",
        "red-brou": "#ED057B",
        "red-brou-2": "#EA1A2F",
        "dark-mode": "#24292F",
        "dark-mode-2": "#1F2428",
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
        "chart-1": "hsl(var(--chart-1))",
        "chart-2": "hsl(var(--chart-2))",
        "chart-3": "hsl(var(--chart-3))",
        "chart-4": "hsl(var(--chart-4))",
        "chart-5": "hsl(var(--chart-5))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", ...fontFamily.sans],
      },
    },
  },
  plugins: [animatePlugin, plugin(addVariablesForColors)],
} satisfies Config;

export default config;
