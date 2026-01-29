import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lobsta: {
          red: '#DC2626',
          'red-dark': '#991B1B',
          'red-light': '#EF4444',
          black: '#0A0A0A',
          'black-light': '#171717',
          'black-lighter': '#262626',
          gray: '#404040',
          'gray-light': '#737373',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'lobsta-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #171717 50%, #1a0505 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
