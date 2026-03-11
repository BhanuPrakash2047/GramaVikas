/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // === PRIMARY ===
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          lighter: '#B7E4C7',
          dark: '#1B4332',
        },

        // === ACCENT ===
        accent: {
          green: '#4CAF50',
          teal: '#3D8B5E',
        },

        // === BACKGROUND ===
        background: {
          DEFAULT: '#F4FAF6',
          card: '#FFFFFF',
          section: '#EAF5EE',
          overlay: '#D8EFE2',
        },

        // === TEXT ===
        text: {
          primary: '#1A1A1A',
          secondary: '#4B5563',
          muted: '#6B7280',
          onPrimary: '#FFFFFF',
          hindi: '#222222',
        },

        // === UI ELEMENTS ===
        ui: {
          border: '#C8E6C9',
          borderActive: '#2D6A4F',
          inputBg: '#FFFFFF',
          shadow: '#A8D5B5',
        },

        // === STATE ===
        state: {
          selected: '#2D6A4F',
          selectedBg: '#EAF5EE',
          unselected: '#F9F9F9',
          disabled: '#D1D5DB',
        },

        // === BRAND ===
        brand: {
          digitalIndia: '#FF6B00',
          logoGreen: '#4CAF50',
          logoBlack: '#1A1A1A',
          ashoka: '#1A237E',
        },

        // === NEUTRAL ===
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // === SHORTHAND SCHEME CLASSES ===
        'scheme-primary': '#2D6A4F',
        'scheme-primary-light': '#52B788',
        'scheme-primary-lighter': '#B7E4C7',
        'scheme-primary-dark': '#1B4332',
        'scheme-accent': '#4CAF50',
        'scheme-accent-teal': '#3D8B5E',
        'scheme-bg': '#F4FAF6',
        'scheme-card': '#FFFFFF',
        'scheme-section': '#EAF5EE',
        'scheme-overlay': '#D8EFE2',
        'scheme-text': '#1A1A1A',
        'scheme-text-secondary': '#4B5563',
        'scheme-text-muted': '#6B7280',
        'scheme-border': '#C8E6C9',
        'scheme-border-active': '#2D6A4F',
        'scheme-selected-bg': '#EAF5EE',
        'scheme-brand-orange': '#FF6B00',
        'scheme-brand-navy': '#1A237E',

        // === UTILITY ===
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
