import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Your custom theme extensions can go here
    },
  },
  plugins: [],
} satisfies Config;
