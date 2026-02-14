"use client"

import * as React from "react"
import { useEffect } from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function ThemeWatcher() {
  const { theme } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'grayscale') {
      root.classList.add('dark')
    } else {
      root.classList.remove('grayscale') // Cleanup if needed, though next-themes handles class swapping usually. 
      // Actually next-themes removes the previous theme class. 
      // But we want to ADD 'dark' if grayscale.
      if (theme !== 'dark' && root.classList.contains('dark')) {
        // If we switched from grayscale to light, we need to ensure 'dark' is removed.
        // But next-themes handles 'system' and 'dark'. 
        // Let's just be specific:
        if (theme === 'light') root.classList.remove('dark')
      }
    }

    // Safety check: if standard dark mode, ensure dark class is there (next-themes does this, but being safe)
  }, [theme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider themes={['light', 'dark', 'grayscale']} {...props}>
      <ThemeWatcher />
      {children}
    </NextThemesProvider>
  )
}
