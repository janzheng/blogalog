
const plugin = require('tailwindcss/plugin'); 
const colors = require('tailwindcss/colors'); 


// this lets you set css variable colors
// colors: { primary: withOpacityValue('--color-primary'), }
function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`
    }
    return `rgb(var(${variable}) / ${opacityValue})`
  }
}

module.exports = {
  // add this section
  content: [
    // './src/**/*.{html,js}',
    // './node_modules/tw-elements/dist/js/**/*.js',
    // './src/**/*.html',
    './node_modules/plasmid/**/*.{svelte,md}',
    './src/**/*.svelte',
    // './src/**/*.md',
  ],
  darkMode: 'media', // or true or 'media' or 'class'
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'md-1': '845px',
      'lg': '1024px',
      'lg-1': '1200',
      'xl': '1280px',
      'xl-1': '1440px',
      '2xl': '1536px',
      //   'team-lg': '1200px',
    },
    colors: {
      ...colors, // include all default colors
      'evergreen': '#dbf4e9',
      'evg-white': '#f7fffb',
      'evg-copy': '#140116',
      'evg-active': '#460646',
      'evg-light': '#6aaae6',
      'evg-green-white': '#e1f3e2',
      'evg-green-dark': '#256725',
      'evg-green-lightest': '#DBF4E9',
      'evg-green-lighter': '#c7f0c9',
      'evg-green-light': '#72dd77',
      'evg-active-green': '#04960b',
      'evg-green': '#E7FAF3',
      'jan': '#971f1f'

    },
    extend: {
      borderRadius: {
        'xs': '1px'
      },
      gridTemplateColumns: {
        '3-1': '3fr 1fr',
        '3-2': '3fr 2fr',
        '2-1': '2fr 1fr',
        '1-2': '1fr 2fr',
        '1-2-2': '1fr 2fr 2fr',
        '1-3': '1fr 3fr',
        '1-4': '1fr 4fr',
        '1-5': '1fr 5fr',
        '2-3': '2fr 3fr',
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              lineHeight: '1.75rem'
            }
          }
        },
        'lg': {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.75rem',
            h1: {
              fontSize: '2rem',
            },
          },
        },
      },
      lineHeight: {
        'extra-loose': '4',
        '12': '2.1rem',
      }
    },
    fontFamily: {
      'sans': ['"Inter"', '"Open Sans"', 'system-ui'],
      'serif': ['Georgia', '"Editorial New"', 'Georgia', 'Constantia', 'serif'],
      'mono': ['Consolas', '"Courier New"', 'Courier', 'monospace'],
      'display': ['Georgia'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss/nesting'),
    require('@tailwindcss/forms'),
    require('tw-elements/dist/plugin'),
    require('@tailwindcss/typography'),
    plugin(function ({ addBase }) {
      addBase({
        '@font-face': {
          // fontFamily: 'Editorial New',
          // fontWeight: '300',
          // src: ['url(/fonts/editorial-new/PPEditorialNew-Regular.eot)',
          //   'url(/fonts/editorial-new/PPEditorialNew-Regular.otf)',
          //   'url(/fonts/editorial-new/PPEditorialNew-Regular.ttf)',
          //   'url(/fonts/editorial-new/PPEditorialNew-Regular.woff)',
          //   'url(/fonts/editorial-new/PPEditorialNew-Regular.woff2)',
          // ]
        }
      })
    }),
    // exposes all colors as css variables: https://gist.github.com/Merott/d2a19b32db07565e94f10d13d11a8574
    // e.g. var(--color-secondary-900)
    function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === 'string'
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    },
  ],
}





