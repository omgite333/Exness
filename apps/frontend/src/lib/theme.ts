import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const KEY = "exness-theme";

let theme: Theme =
  typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "light"
    ? "light"
    : "dark";

const listeners = new Set<() => void>();

function apply() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
}

export function getTheme(): Theme {
  return theme;
}

export function setTheme(t: Theme) {
  theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
  apply();
  listeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(theme === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    getTheme,
    getTheme
  );
}

// Apply the saved theme as soon as this module loads.
apply();
