/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./src/**/**.{html,js,svelte,ts}"
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs':'0.625rem',
        'xxxs':'0.25rem'
      }
    },
  },
  plugins: [],
}
