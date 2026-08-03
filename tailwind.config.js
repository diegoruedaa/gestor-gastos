/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Base neutral scale (grays/whites) used for backgrounds, borders, text.
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Primary accent — deep petrol blue. See README/handoff notes for the
        // 2-3 alternative options considered before picking this one.
        accent: {
          50: '#eef5f5',
          100: '#d6e6e7',
          200: '#aecdd0',
          300: '#80aeb2',
          400: '#528d92',
          500: '#387176',
          600: '#2b5a60', // primary accent
          700: '#23484d',
          800: '#1c3a3e',
          900: '#152d30',
        },
        // Per-category colors, matching the `color` column seeded in the
        // `categories` table (supabase/seed.sql) — keep these two in sync.
        // Chroma/lightness tuned (same hue families as the original pastel
        // set) so all 5 clear the dataviz skill's colorblind-safety
        // validator (adjacent + all-pairs, deutan/protan) — see
        // scripts/validate_palette.js in the dataviz skill.
        category: {
          comida: '#6bb888',
          compras: '#c796d2',
          ocio: '#1f8dae',
          viajes: '#b48637',
          suscripciones: '#934d37',
        },
      },
    },
  },
  plugins: [],
}
