/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        split: {
          oat: '#F5F3EF',
          linen: '#FFFFFF',
          subtle: '#ECEAE5',
          espresso: '#191614',
          stone: '#231F1C',
          darksubtle: '#2E2925',
          terracotta: '#C25E36',
          terracottamuted: '#F5ECE6',
          ink: '#26221F',
          bean: '#59524C',
          warmstone: '#8C827A',
          sage: '#2E7D5B',
          brick: '#A8443B',
        }
      },
      fontFamily: {
        heading: ["PlusJakartaSans_600SemiBold"],
        headingBold: ["PlusJakartaSans_700Bold"],
        body: ["Inter_400Regular"],
        bodyMedium: ["Inter_500Medium"],
        mono: ["monospace"],
      }
    },
  },
  plugins: [],
};
