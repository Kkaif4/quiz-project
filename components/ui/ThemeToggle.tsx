"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      // Determine initial theme from DOM or localStorage or system preference
      const stored = localStorage.getItem("lemon_theme") as "light" | "dark" | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(isSystemDark ? "dark" : "light");
      }
    });

    // Listen to system changes if user hasn't set explicit preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("lemon_theme")) {
        const next = e.matches ? "dark" : "light";
        setTheme(next);
        document.documentElement.classList.toggle("dark", e.matches);
        document.documentElement.setAttribute("data-theme", next);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("lemon_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-plum)]/30 hover:bg-[var(--card-hover)] transition-all duration-200 active:scale-95 shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-plum)] ${className}`}
      aria-label={theme === "dark" ? "Switch to warm light mode" : "Switch to cozy dark mode"}
      title={theme === "dark" ? "Switch to warm light mode" : "Switch to cozy dark mode"}
    >
      {/* Sun icon for Dark mode (switch to Light) */}
      <Sun
        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-[var(--accent-champagne-dark)] transition-all duration-300 transform ${
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
        }`}
      />

      {/* Moon icon for Light mode (switch to Dark) */}
      <Moon
        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-[var(--accent-plum)] transition-all duration-300 transform ${
          theme === "dark" ? "scale-0 rotate-90 opacity-0 absolute" : "scale-100 rotate-0 opacity-100"
        }`}
      />
    </button>
  );
}
