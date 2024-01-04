
// const plugin = require('tailwindcss/plugin'); 
// const colors = require('tailwindcss/colors'); 


// this lets you set css variable colors
// colors: { primary: withOpacityValue('--color-primary'), }
// function withOpacityValue(variable) {
//   return ({ opacityValue }) => {
//     if (opacityValue === undefined) {
//       return `rgb(var(${variable}))`
//     }
//     return `rgb(var(${variable}) / ${opacityValue})`
//   }
// }

module.exports = {

  // add this section
  content: [
    // note: use single * (not **) for much faster tw hmr, but paths>2 won't be scanned
    // try not to scan /plasmid... it's a ton
    // './src/**/*.{html,js}',
    // './node_modules/tw-elements/dist/js/**/*.js',
    // './src/**/*.html',
    // './node_modules/plasmid/**/*.{svelte,md}',
    './src/lib/**/*.svelte',
    './src/routes/**/*.svelte',
    // './src/*/*.svelte',
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
    // colors: {
    //   // ...colors, // include all default colors
    //   'base': '#37352f',
    //   'jan': "#971f1f",
    //   'jan-': { // color range similar to zinc's distribution
    //     50: "#f2e0e0",
    //     100: "#e6c2c2",
    //     200: "#db9f9f",
    //     300: "#cf7d7d",
    //     400: "#c35a5a",
    //     500: "#b73838",
    //     600: "#971f1f",
    //     700: "#7c0606",
    //     800: "#610000",
    //     900: "#460000"
    //   },

    // },
    extend: {
      borderRadius: {
        'xs': '1px'
      },
      scale: {
        '25': '0.25',
        '10': '0.10',
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
      // colors: { // for a17t and for color-neutral-400 etc.
      //   neutral: colors.slate,
      //   positive: colors.green,
      //   urge: colors.violet,
      //   warning: colors.yellow,
      //   info: colors.blue,
      //   critical: colors.red,
      // }
    },
    fontFamily: {
      'sans': ['Inter', '"Open Sans"', 'system-ui'],
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
    // require("daisyui"),
    require('tailwindcss/nesting'),
    // require('@tailwindcss/forms'),
    // require('tw-elements/dist/plugin'),
    // require('@tailwindcss/typography'),
    // plugin(function ({ addBase }) {
    //   addBase({
    //     '@font-face': {
    //       // fontFamily: 'Editorial New',
    //       // fontWeight: '300',
    //       // src: ['url(/fonts/editorial-new/PPEditorialNew-Regular.eot)',
    //       //   'url(/fonts/editorial-new/PPEditorialNew-Regular.otf)',
    //       //   'url(/fonts/editorial-new/PPEditorialNew-Regular.ttf)',
    //       //   'url(/fonts/editorial-new/PPEditorialNew-Regular.woff)',
    //       //   'url(/fonts/editorial-new/PPEditorialNew-Regular.woff2)',
    //       // ]
    //     }
    //   })
    // }),

    // exposes all colors as css variables: https://gist.github.com/Merott/d2a19b32db07565e94f10d13d11a8574
    // e.g. var(--color-secondary-900)
    // function ({ addBase, theme }) {
    //   function extractColorVars(colorObj, colorGroup = '') {
    //     return Object.keys(colorObj).reduce((vars, colorKey) => {
    //       const value = colorObj[colorKey];

    //       const newVars =
    //         typeof value === 'string'
    //           ? { [`--color${colorGroup}-${colorKey}`]: value }
    //           : extractColorVars(value, `-${colorKey}`);

    //       return { ...vars, ...newVars };
    //     }, {});
    //   }

    //   addBase({
    //     ':root': extractColorVars(theme('colors')),
    //   });
    // },
  ],







  // always compile these!
  // https://tailwindcss.com/docs/content-configuration#using-regular-expressions
  // safelist: [

  //   // grid / flex / template / col
  //   'col-span-full',
  //   {
  //     pattern: /grid-cols-(2|3|4|5|6)/,
  //     variants: ['xs', 'md', 'lg', 'xl'],
  //   },

    

  //   // padding
  //   {
  //     pattern: /p-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },
  //   // margins
  //   {
  //     pattern: /m-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },
  //   {
  //     pattern: /leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)/,
  //     variants: ['xs', 'md', 'lg', 'xl'],
  //   },

  //   // grid/flex options
  //   'items-center',
  //   'justify-center',
  //   'flex-1',
  //   'flex-row',
  //   'flex-col',
  //   'grow', 'grow-0',
  //   'shrink',

  //   'text-left',
  //   'text-center',
  //   'text-right',
  //   'text-justify',

  //   'tracking-tighter',
  //   'tracking-tight',
  //   'tracking-normal',
  //   'tracking-wide',
  //   'tracking-wider',
  //   'tracking-widest',
    
  //   // typograph
  //   // {
  //   //   pattern: /bg-(red|green|blue)-(100|200|300)/,
  //   //   variants: ['lg', 'hover', 'focus', 'lg:hover'],
  //   // },
  //   {
  //     pattern: /text-(sm|base|lg|xl|2xl|3xl|4xl)/,
  //     variants: ['xs', 'md', 'lg', 'xl'],
  //   },
  //   {
  //     pattern: /(w|h|max-h|max-w|mx|my|mt|mr|mb|ml|px|py|pt|pr|pb|pl)-(2|3|4|6|8|10|12|14|20|24|32|36|40|48|60|64|72|80|96|1\/3|2\/3|1\/4|1\/2|full|screen|min|max|fit|auto)/,
  //     variants: ['xs', 'md', 'lg', 'xl', 'odd', 'even', 'first', 'last'],
  //   },
  //   {
  //     pattern: /(scale|scale-x|scale-y)-(0|10|25|50|75|90|95|100|105|110|125|150)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },

  //   // rounded, block, no-underline
  //   {
  //     pattern: /rounded-(t|r|b|l|ss|se|ee|es|tl|tr|br|bl)-(none|sm|md|lg|xl|2xl|3xl|full)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },
    
  //   'block', 'flex', 'inline-block',
  //   'no-underline',
  //   'hover:no-underline',

  //   // font styles
  //   'font-sans',
  //   'font-serif',
  //   'font-display',
  //   'font-thin',
  //   'font-extralight',
  //   'font-light',
  //   'font-normal',
  //   'font-medium',
  //   'font-semibold',
  //   'font-bold',
  //   'font-extrabold',
  //   'font-black',
  //   'antialiased',
  //   'subpixel-antialiased',

  //   'float-start', 'float-end', 'float-right', 'float-left', 'float-none', 
  //   'clear-start', 'clear-end', 'clear-left', 'clear-right', 'clear-both', 'clear-none',


  //   // transition timing functions
  //   {
  //     pattern: /ease-(linear|in|out|in-out)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },

  //   // transition durations
  //   'duration-0',
  //   'duration-75',
  //   'duration-100',
  //   'duration-150',
  //   'duration-200',
  //   // 'duration-300',
  //   // 'duration-500',
  //   // 'duration-700',
  //   // 'duration-1000',
    
  //   'overflow-hidden',
  //   'overflow-x-hidden',
  //   'overflow-y-hidden',
  //   'overflow-auto',
  //   'overflow-scroll',
  //   'overflow-x-scroll',
  //   'overflow-y-scroll',
  //   'object-cover',
  //   'object-contain',
  //   'object-fill',
  //   'object-bottom',
  //   'object-center',
  //   'object-left',
  //   'object-left-bottom',
  //   'object-left-top',
  //   'object-right',
  //   'object-right-bottom',
  //   'object-right-top',
  //   'object-top',

  //   'transform',
  //   {
  //     pattern: /translate-(x|y)-(0|px|0.5|1|1.5|2|2.5|3|3.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|full|1\/2|1\/3|2\/3|1\/4|2\/4|3\/4)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },

  //   // bg colors
  //   {
  //     pattern: /bg-(white|black|slate|gray|zinc|neutral|stone|red|yellow|green|emerald|sky|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
  //     variants: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
  //   },
  //   // text colors
  //   {
  //     pattern: /text-(white|black|slate|gray|zinc|neutral|stone|red|yellow|green|emerald|sky|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
  //     variants: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
  //   },
  //   // border width
  //   {
  //     pattern: /(border-t|border-r|border-b|border-l)-(0|1|2|3|4|5|6|8)/,
  //     variants: ['responsive', 'hover', 'focus'],
  //   },
  //   // border colors
  //   {
  //     pattern: /border-(white|black|slate|gray|zinc|neutral|stone|red|yellow|green|emerald|sky|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
  //     variants: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
  //   },
  // ],
}





