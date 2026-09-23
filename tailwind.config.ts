import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#effcfb", 100: "#d6f7f4", 200: "#afece6",
          300: "#79ded6", 400: "#43c8c0", 500: "#20aaa5",
          600: "#188b89", 700: "#176f70", 800: "#18585a", 900: "#174a4c"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;
