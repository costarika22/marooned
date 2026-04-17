/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#fff7e8",
        coral: "#ff8f6b",
        lagoon: "#49c6c0",
        palm: "#1f7a6c",
        dusk: "#23415b"
      },
      boxShadow: {
        floaty: "0 24px 60px rgba(35, 65, 91, 0.18)"
      },
      fontFamily: {
        sans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
