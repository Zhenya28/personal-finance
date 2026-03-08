"use client";

import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme, type AccentColor } from "./ThemeProvider";

const ACCENT_OPTIONS: { value: AccentColor; label: string; color: string }[] = [
  { value: "neutral", label: "Domyslny", color: "bg-zinc-500" },
  { value: "blue", label: "Niebieski", color: "bg-blue-500" },
  { value: "violet", label: "Fioletowy", color: "bg-violet-500" },
  { value: "emerald", label: "Zielony", color: "bg-emerald-500" },
  { value: "rose", label: "Rozowy", color: "bg-rose-500" },
  { value: "amber", label: "Pomaranczowy", color: "bg-amber-500" },
];

export function ThemeToggle() {
  const { theme, accent, toggleTheme, setAccent } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full bg-secondary">
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-secondary">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 rounded-2xl border border-border p-2" side="top" align="end">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-1.5">
            Accent
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAccent(opt.value)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
                  accent === opt.value
                    ? "bg-primary/10 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                <span className={`h-5 w-5 rounded-full ${opt.color}`} />
                <span className="text-[9px] text-muted-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
