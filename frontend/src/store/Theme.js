import { create } from "zustand";

const getInitialTheme = () => {
  // 1. Stockage local
  const stored = localStorage.getItem("selected-theme");
  if (stored === "dark" || stored === "light") return stored;

  // 2. Préférence système utilisateur
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) return "dark";

  // 3. Sinon : heure locale
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  setTheme: (newTheme) => {
    set({ theme: newTheme });
    document.body.classList.toggle("dark-theme", newTheme === "dark");
    localStorage.setItem("selected-theme", newTheme);
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      document.body.classList.toggle("dark-theme", newTheme === "dark");
      localStorage.setItem("selected-theme", newTheme);
      return { theme: newTheme };
    });
  },
}));