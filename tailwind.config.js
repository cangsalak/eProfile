/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        /* NextAdmin HQ Color Tokens */
        'background-gray-secondary_alt_2': 'var(--background-gray-secondary_alt_2)',
        'background-gray-secondary_alt': 'var(--background-gray-secondary_alt)',
        'background-gray-primary': 'var(--background-gray-primary)',
        'background-gray-secondary': 'var(--background-gray-secondary)',
        'background-gray-tertiary': 'var(--background-gray-tertiary)',
        'background-gray-quaternary': 'var(--background-gray-quaternary)',
        'input-background': 'var(--input-background)',
        'card-surface-area': 'var(--card-surface-area)',
        'card-background': 'var(--card-background)',
        'sidebar-navigation-nav-item-nav-hover-background': 'var(--sidebar-navigation-nav-item-nav-hover-background)',
        'background-white-secondary': 'var(--background-white-secondary)',
        'background-white-primary': 'var(--background-white-primary)',
        'dropdowns-background': 'var(--dropdowns-background)',
        'tooltip-background': 'var(--tooltip-background)',

        /* Text */
        'text-tertiary': 'var(--text-tertiary)',
        'text-secondary': 'var(--text-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-disable': 'var(--text-disable)',

        /* Icons */
        'icon-tertiary': 'var(--icon-tertiary)',
        'icon-secondary': 'var(--icon-secondary)',
        'icon-primary': 'var(--icon-primary)',

        /* Borders */
        'input-border': 'var(--input-border)',
        'card-border': 'var(--card-border)',
        'card-surface-border': 'var(--card-surface-border)',
        'border-secondary-alt': 'var(--border-secondary-alt)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',

        /* Brand */
        'brand-100': 'var(--brand-100)',
        'brand-200': 'var(--brand-200)',
        'brand-300': 'var(--brand-300)',
        'brand-400': 'var(--brand-400)',
        'brand-500': 'var(--brand-500)',
        'brand-600': 'var(--brand-600)',
        'base-white': 'var(--base-white)',
      },
      spacing: {
        '67.5': '16.875rem', // 270px
        '384': '96rem',
      },
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        niramit: ['Niramit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
