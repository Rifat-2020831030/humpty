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
        background: '#000000',
        foreground: '#ededed',
        primary: {
          DEFAULT: '#006a4e',
          foreground: '#ffffff',
          hover: '#00523d',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          card: '#121212',
          subtle: '#171717',
        },
        border: {
          DEFAULT: '#262626',
          strong: '#404040',
        },
      },
    },
  },
  plugins: [],
};

export default config;
