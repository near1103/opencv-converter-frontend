/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkblue: {
          DEFAULT: '#1e293b', // slate-800
          light: '#3b82f6',   // blue-500
          lighter: '#60a5fa', // blue-400
          hover: '#2563eb',   // blue-600
          sidebar: '#334155', // slate-700
          border: '#475569'   // slate-600
        },
      },
    },
  },
  plugins: [],
};

