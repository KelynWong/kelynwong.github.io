/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-color)',
        text: 'var(--text-color)',
        accent1: 'var(--accent-color-1)',
        accent2: 'var(--accent-color-2)',
        accent3: 'var(--accent-color-3)',
        code1: 'var(--code-color-1)',
        code2: 'var(--code-color-2)',
        code3: 'var(--code-color-3)',
        code4: 'var(--code-color-4)',
        code5: 'var(--code-color-5)',
      },
      fontFamily: {
        sans: ['Source Code Pro'], 
      },
      fontSize: {
        h0: 'var(--h0)',        // h0 -> 64px
        h1: 'var(--h1)',        // h1 -> 36px
        h2: 'var(--h2)',        // h2 -> 28px
        h3: 'var(--h3)',        // h3 -> 24px
        h4: 'var(--h4)',        // h4 -> 20px
        h5: 'var(--h5)',        // h5 -> 18px
        paragraph: 'var(--paragraph)', // paragraph -> 16px
      },
    },
  },
  plugins: [],
};