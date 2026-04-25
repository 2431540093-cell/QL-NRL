import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - matching the sample design
        primary: {
          50: '#f0f7ff',
          100: '#e1f0ff',
          200: '#bae6ff',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c2d42',
          950: '#1e3a5f', // Main dark blue used in sidebar
        },
        // Accent colors - yellow/amber
        accent: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Neutral/Gray
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      backgroundColor: {
        'sidebar': '#1e3a5f',
        'sidebar-hover': '#0c2d42',
        'sidebar-active': '#fbbf24',
      },
      textColor: {
        'sidebar': '#ffffff',
        'sidebar-active': '#1e3a5f',
        'primary': '#1e3a5f',
      },
      borderColor: {
        'sidebar-active': '#fbbf24',
      },
    },
  },
  plugins: [],
};

export default config;
