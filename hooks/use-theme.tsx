"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

interface ThemeStore {
  theme: "light" | "dark"
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
  hasHydrated: boolean
  finishHydration: () => void
}

const getPersistedTheme = (persistedState: unknown): ThemeStore["theme"] => {
  if (!persistedState || typeof persistedState !== "object") return "dark"

  const theme = (persistedState as { theme?: unknown }).theme
  return theme === "light" || theme === "dark" ? theme : "dark"
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setTheme: (theme) => set({ theme }),
      hasHydrated: false,
      finishHydration: () => set({ hasHydrated: true }),
    }),
    {
      name: "buxdev-theme",
      partialize: (state) => ({ theme: state.theme }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        theme: getPersistedTheme(persistedState),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state && !error) {
          state.finishHydration()
          return
        }

        queueMicrotask(() => {
          try {
            window.localStorage.removeItem("buxdev-theme")
          } catch {
            // Storage can be unavailable in restricted browsing contexts.
          }
          useTheme.setState({ hasHydrated: true })
        })
      },
    },
  ),
)

export function useThemeEffect() {
  const theme = useTheme((state) => state.theme)
  const hasHydrated = useTheme((state) => state.hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return

    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [hasHydrated, theme])
}
