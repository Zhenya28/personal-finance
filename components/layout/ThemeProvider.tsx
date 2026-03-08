"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

export type AccentColor =
  | "neutral"
  | "blue"
  | "violet"
  | "emerald"
  | "rose"
  | "amber";

type AccentVars = {
  "--primary": string;
  "--primary-foreground": string;
  "--ring": string;
};

const ACCENT_MAP: Record<
  Exclude<AccentColor, "neutral">,
  { light: AccentVars; dark: AccentVars }
> = {
  blue: {
    light: {
      "--primary": "#3b82f6",
      "--primary-foreground": "#ffffff",
      "--ring": "#3b82f6",
    },
    dark: {
      "--primary": "#60a5fa",
      "--primary-foreground": "#0f172a",
      "--ring": "#60a5fa",
    },
  },
  violet: {
    light: {
      "--primary": "#7c3aed",
      "--primary-foreground": "#ffffff",
      "--ring": "#7c3aed",
    },
    dark: {
      "--primary": "#8b5cf6",
      "--primary-foreground": "#0f172a",
      "--ring": "#8b5cf6",
    },
  },
  emerald: {
    light: {
      "--primary": "#10b981",
      "--primary-foreground": "#ffffff",
      "--ring": "#10b981",
    },
    dark: {
      "--primary": "#34d399",
      "--primary-foreground": "#052e2b",
      "--ring": "#34d399",
    },
  },
  rose: {
    light: {
      "--primary": "#e11d48",
      "--primary-foreground": "#ffffff",
      "--ring": "#e11d48",
    },
    dark: {
      "--primary": "#fb7185",
      "--primary-foreground": "#3a0718",
      "--ring": "#fb7185",
    },
  },
  amber: {
    light: {
      "--primary": "#f59e0b",
      "--primary-foreground": "#1f2937",
      "--ring": "#f59e0b",
    },
    dark: {
      "--primary": "#fbbf24",
      "--primary-foreground": "#1f2937",
      "--ring": "#fbbf24",
    },
  },
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.backgroundColor = theme === "dark" ? "#0d1628" : "#e9eff7";
  document.documentElement.style.colorScheme = theme;
}

function applyAccent(accent: AccentColor, theme: Theme) {
  const root = document.documentElement;
  const vars = ["--primary", "--primary-foreground", "--ring"] as const;

  if (accent === "neutral") {
    for (const key of vars) root.style.removeProperty(key);
    return;
  }

  const accentVars = ACCENT_MAP[accent][theme];
  for (const key of vars) root.style.setProperty(key, accentVars[key]);
}

const ThemeContext = createContext<{
  theme: Theme;
  accent: AccentColor;
  toggleTheme: () => void;
  setAccent: (color: AccentColor) => void;
}>({
  theme: "dark",
  accent: "neutral",
  toggleTheme: () => {},
  setAccent: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<AccentColor>("neutral");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      const savedAccent = localStorage.getItem("accent");

      const nextTheme =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      const nextAccent: AccentColor =
        savedAccent === "blue" ||
        savedAccent === "violet" ||
        savedAccent === "emerald" ||
        savedAccent === "rose" ||
        savedAccent === "amber"
          ? savedAccent
          : "neutral";

      setTheme(nextTheme);
      setAccentState(nextAccent);
      applyTheme(nextTheme);
      applyAccent(nextAccent, nextTheme);
    } catch {
      // Ignore storage access errors.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Ignore storage access errors.
      }
      applyTheme(next);
      applyAccent(accent, next);
      return next;
    });
  }, [accent]);

  const setAccent = useCallback(
    (color: AccentColor) => {
      setAccentState(color);
      try {
        localStorage.setItem("accent", color);
      } catch {
        // Ignore storage access errors.
      }
      applyAccent(color, theme);
    },
    [theme]
  );

  const contextValue = useMemo(
    () => ({
      theme,
      accent,
      toggleTheme,
      setAccent,
    }),
    [theme, accent, toggleTheme, setAccent]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
