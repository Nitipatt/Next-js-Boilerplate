import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      base: '12px', // Set the default font size to 12px
    },
    extend: {
      fontSize: {
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        34: '34px',
        40: '40px',
      },
      lineHeight: {
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        34: '34px',
        40: '40px',
      },
      spacing: {
        2: '2px',
        4: '4px',
        6: '6px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        34: '34px',
        40: '40px',
        44: '44px',
        48: '48px',
        50: '50px',
        56: '56px',
        312: '312px',
      },
      colors: {
        'pantip-dark': '#222222',
        'pantip-purple-light': '#4A3B63',
        'pantip-purple-dark': '#362D4A',
        'pantip-indigo': '#6C63FF',
        'pantip-gray': {
          light: '#9CA3AF',
          DEFAULT: '#4B5563',
        },
      },
      width: {
        40: '40px',
        56: '56px',
        64: '64px',
      },
      height: {
        40: '40px',
        176: '176px',
      },
    },
  },
  plugins: [],
} satisfies Config;
