/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        rd: {
          light: "#FF5E66",
          DEFAULT: "#E83E47",
          dark: "#9C1A21",
        },
        grn: {
          light: "#3FE86A",
          DEFAULT: "#5ef383",
          dark: "#0B9C30",
        },
        dark: "#171717",
      },
    },
  },
  plugins: [],
};
