/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F1F5F9',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#EFF6FF',
        },
        success: {
          DEFAULT: '#15803D',
          subtle: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#B45309',
          subtle: '#FFFBEB',
        },
        danger: {
          DEFAULT: '#B91C1C',
          subtle: '#FEF2F2',
        },
        info: {
          DEFAULT: '#0369A1',
          subtle: '#F0F9FF',
        },
        disabled: '#94A3B8',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        badge: '6px',
        input: '8px',
        btn: '8px',
        card: '12px',
        dialog: '16px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
}

