import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:              'var(--bg)',
        'bg-elevated':   'var(--bg-elevated)',
        'bg-subtle':     'var(--bg-subtle)',
        text:            'var(--text)',
        'text-muted':    'var(--text-muted)',
        'text-faint':    'var(--text-faint)',
        border:          'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent:          'var(--accent)',
        'accent-hover':  'var(--accent-hover)',
        'accent-soft':   'var(--accent-soft)',
        'accent-text':   'var(--accent-text)',
        hard:            'var(--hard)',
        medium:          'var(--medium)',
        easy:            'var(--easy)',
      },
    },
  },
  plugins: [],
} satisfies Config;
