
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
      'base': '#37352f',
      'jan': "#971f1f",
      'jan-': { // color range similar to zinc's distribution
        50: "#f2e0e0",
        100: "#e6c2c2",
        200: "#db9f9f",
        300: "#cf7d7d",
        400: "#c35a5a",
        500: "#b73838",
        600: "#971f1f",
        700: "#7c0606",
        800: "#610000",
        900: "#460000"
      },

    },
    extend: {
      borderRadius: {
        'xs': '1px'
      },
      gridColumn: {
        'span-full': 'span 2 / span 2', // Ensures the element spans two columns
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
      },
      colors: { // for a17t and for color-neutral-400 etc.
        neutral: colors.slate,
        positive: colors.green,
        urge: colors.violet,
        warning: colors.yellow,
        info: colors.blue,
        critical: colors.red,
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
    extend: {
      gridColumn: ['first', 'nth-child-2'], // Add custom variants
    },
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







  // always compile these!
  // https://tailwindcss.com/docs/content-configuration#using-regular-expressions
  safelist: [

    // grid / flex / template / col
    'col-span-full',
    {
      pattern: /grid-cols-(2|3|4|5|6)/,
      variants: ['xs', 'md', 'lg', 'xl'],
    },

    

    // padding
    {
      pattern: /p-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64)/,
      variants: ['responsive', 'hover', 'focus'],
    },
    // margins
    {
      pattern: /m-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64)/,
      variants: ['responsive', 'hover', 'focus'],
    },
    // grid/flex options
    'items-center',
    'justify-center',
    'flex-row',
    'flex-col',

    // typograph
    // {
    //   pattern: /bg-(red|green|blue)-(100|200|300)/,
    //   variants: ['lg', 'hover', 'focus', 'lg:hover'],
    // },
    {
      pattern: /text-(sm|base|lg|xl|2xl|3xl|4xl)/,
      variants: ['xs', 'md', 'lg', 'xl'],
    },
    {
      pattern: /(w|h|max-h|max-w|mx|my|mt|mr|mb|ml|px|py|pt|pr|pb|pl)-(2|3|4|6|8|10|12|14|20|24|32|36|40|48|60|64|72|80|96|1\/3|2\/3|1\/4|1\/2|full|screen|min|max)/,
      variants: ['xs', 'md', 'lg', 'xl'],
    },

    // rounded, block, no-underline
    'rounded',
    'block',
    'no-underline',
    'hover:no-underline',
    // font styles
    'font-sans',
    'font-serif',
    'font-display',
    'overflow-scroll',
    'overflow-x-scroll',
    'overflow-y-scroll',



    // bg colors
    {
      pattern: /bg-(white|black|slate|gray|zinc|neutral|stone|red|yellow|green|emerald|sky|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
    },
    // text colors
    {
      pattern: /text-(white|black|slate|gray|zinc|neutral|stone|red|yellow|green|emerald|sky|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
    },
    // border width
    {
      pattern: /border-(0|1|2|3|4|5|6|8)/,
      variants: ['responsive', 'hover', 'focus'],
    },
    // border colors
    {
      pattern: /border-(white|black|slate|gray|zinc|neutral|stone|red|yellow|green|emerald|sky|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
    },
  ],
}





