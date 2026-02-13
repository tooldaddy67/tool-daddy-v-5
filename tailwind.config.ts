import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Custom tool colors
        blue: { '500': '#3b82f6' },
        green: { '500': '#22c55e' },
        yellow: { '500': '#eab308' },
        purple: { '500': '#a855f7' },
        pink: { '500': '#ec4899' },
        indigo: { '500': '#6366f1' },
        red: { '500': '#ef4444' },
        cyan: { '400': '#22d3ee', '500': '#06b6d4' },
        orange: { '400': '#fb923c', '500': '#f97316' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) * 0.75)',
        sm: 'calc(var(--radius) * 0.5)',
        xl: 'calc(var(--radius) * 1.5)',
        '2xl': 'calc(var(--radius) * 2)',
        '3xl': 'calc(var(--radius) * 3)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'shake': {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
      },
      backdropBlur: {
        md: 'calc(var(--glass-blur) / 2)',
        lg: 'var(--glass-blur)',
        xl: 'calc(var(--glass-blur) * 1.5)',
        '2xl': 'calc(var(--glass-blur) * 2)',
      },
      transitionDuration: {
        DEFAULT: 'calc(150ms * var(--anim-speed))',
      },
      boxShadow: {
        'blue-500/30': '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
        'green-500/30': '0 4px 14px 0 rgba(34, 197, 94, 0.3)',
        'yellow-500/30': '0 4px 14px 0 rgba(234, 179, 8, 0.3)',
        'purple-500/30': '0 4px 14px 0 rgba(168, 85, 247, 0.3)',
        'pink-500/30': '0 4px 14px 0 rgba(236, 72, 153, 0.3)',
        'indigo-500/30': '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
        'red-500/30': '0 4px 14px 0 rgba(239, 68, 68, 0.3)',
        'cyan-500/30': '0 4px 14px 0 rgba(6, 182, 212, 0.3)',
        'orange-500/30': '0 4px 14px 0 rgba(249, 115, 22, 0.3)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
