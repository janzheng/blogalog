

<script>
  import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
  import { browser } from '$app/environment'; 
	import { currentPage, isMenuOpen, user } from '$lib/store'
	// import { navItems } from '$lib/config'
  import { page } from '$app/stores'
  import { PUBLIC_PROJECT_NAME, PUBLIC_BLOGMODE } from '$env/static/public';

  import Head from '$lib/components/shared/Head.svelte'
	// import Header from '$lib/layouts/Header.svelte'
	import Footer from '$lib/layouts/Footer.svelte'
	import '$src/app.scss'

  export let data;
  export let layoutStyle = "style-blogalog"

	const transitionIn = { delay: 150, duration: 150 };
	const transitionOut = { duration: 100 };


  import { SiteData } from '$plasmid/modules/content/store.js'
  import { onDestroy, setContext } from 'svelte';
  $SiteData = {Content: $page.data?.content}
  setContext('SiteData', SiteData);

	// $: currentPage.set(data.path);
  // $user = $page.data?.user || null
  $: if(browser) console.log('[routes][+layout.svelte] $page.data:', $page.data, $page.data.cytosis)

  let heightOfFooter
</script>
















<!-- root layout does NOT come with a Head! -->
<!-- all Head need to be in a layout group -->

<svelte:head>
  <script defer data-domain="{$page.data.planUrl},rollup.blogalog.net" src="https://plausible.io/js/script.js"></script>
</svelte:head> 

<Head />

{#if PUBLIC_BLOGMODE!=='janzheng'}
  <div id="layout" class="layout {"project-"+PUBLIC_PROJECT_NAME}  {layoutStyle}" class:open={$isMenuOpen}>
    <div class="ContentContainer |">
      <main
        class="ContentBody"
        style={heightOfFooter ? `min-height: calc(100vh - ${heightOfFooter + 20}px)` : ''}
        id="main"
        tabindex="-1"
        in:fade={transitionIn}
        out:fade={transitionOut}
      >
        <slot />
      </main>
      <Footer bind:clientHeight={heightOfFooter} content={$page.data.cytosis?.['site-data']?.['Footer']?.Content} />
    </div>
  </div>

{:else}
  <div id="layout" class="layout {"project-"+PUBLIC_PROJECT_NAME} style-janzheng" class:open={$isMenuOpen}>
    <div id="top" class="ContentFrame Layout" :class="isLoaded ? '--loaded' : ''" >
      <div class="color-palette color-top" id="top">
        <div id="c1"></div><div id="c2"></div><div id="c3"></div><div id="c4"></div><div id="c5"></div>
        <div id="a1"></div><div id="a2"></div><div id="a3"></div><div id="a4"></div><div id="a5"></div>
      </div>

      <div class="ContentContainer">

        <nav class="ContentNav">
          <div class="_nav-content">
            <!-- <span class="_nav-links">
              <a href="mailto:hello@janzheng.com">hello@janzheng.com</a> <span>/</span>
              <a href="./files/resume.pdf">résumé</a> <span>/</span>
              <a class="_nav-more " href="./about.html"> about</a>
            </span> -->
            <a class="_nav-logo" href="/"><svg width="66" height="25" viewBox="34 26 66 25" xmlns="http://www.w3.org/2000/svg"><path d="M83.35 50.33h-5.4V39.87c0-1.25-.32-2.2-.97-2.9-.66-.67-1.56-1-2.72-1-1.15 0-2.05.33-2.7 1-.66.7-1 1.65-1 2.9v10.46h-6.55v-2.8c-1.43 2.03-3.34 3.04-5.74 3.04-2.4 0-4.44-.92-6.14-2.76-1.03-1.1-1.75-2.4-2.16-3.88-.22 1.88-.95 3.4-2.18 4.55-1.5 1.4-3.44 2.1-5.8 2.1-2.34 0-4.26-.7-5.75-2.1C34.75 47.1 34 45.14 34 42.6h5.87c.02.92.23 1.6.62 2.03.38.44.9.66 1.5.66.63 0 1.15-.23 1.55-.67.4-.43.6-1.1.6-2.03V26.1h5.9v11.18c.43-1.38 1.12-2.6 2.1-3.65 1.7-1.85 3.77-2.78 6.22-2.78 2.45 0 4.34.9 5.65 2.73v-2.52h6.54v2.83c1.22-2.03 3.17-3.05 5.84-3.05 2.22 0 4 .74 5.38 2.2 1.37 1.5 2.05 3.5 2.05 6.02v5.35l9.37-13.84H82.87v-4.5H100v4.5L89.67 45.84H100v4.5H83.35zM64.02 40.7c0-1.52-.43-2.7-1.28-3.5-.85-.83-1.83-1.24-2.94-1.24-1.1 0-2.08.42-2.93 1.25-.85.84-1.28 2-1.28 3.53 0 1.52.42 2.7 1.27 3.5.85.82 1.83 1.23 2.93 1.23s2.1-.4 2.94-1.24c.85-.83 1.28-2 1.28-3.52z" fill="#971F1F" fill-rule="evenodd"></path></svg></a>
          </div>
          <div class="_nav-bottom">
            <div><a href="https://www.linkedin.com/in/janzh"><span class="_font-phage icon-linkedin text-jan-i"/></a></div>
            <div><a href="https://github.com/janzheng"><span class="_font-phage icon-github-circled text-jan-i"/></a></div>
            <div><a href="https://twitter.com/@yawnxyz"><span class="_font-phage icon-twitter text-jan-i"/></a></div>
            <div><a href="mailto:hello@janzheng.com"><span class="_font-phage icon-mail text-jan-i"/></a></div>
          </div>
        </nav>

      
        <main
          class="ContentBody"
          id="main"
          tabindex="-1"
          in:fade={transitionIn}
          out:fade={transitionOut}
        >
          <slot />
        </main>

        <Footer bind:clientHeight={heightOfFooter} />
      </div>

    </div>

  </div>
{/if}


<style lang="scss" global>

  .ContentBody {
    min-height: calc(100vh - 250px);
  }

  .color-palette {
    position: absolute;
    z-index: 100000;
    width: 100%;
    height: auto;
  }
  .color-palette #c1 {
    background-color: #9C001A;
  }
  .color-palette #c2 {
    background-color: #FFFBDB;
  }
  .color-palette #c3 {
    background-color: #ACBFCC;
  }
  .color-palette #c4 {
    background-color: #77838C;
  }
  .color-palette #c5 {
    background-color: #41484C;
  }
  .color-palette #a1 {
    background-color: #2A3140;
  }
  .color-palette #a2 {
    background-color: #F2D399;
  }
  .color-palette #a3 {
    background-color: #F29863;
  }
  .color-palette #a4 {
    background-color: #D95F43;
  }
  .color-palette #a5 {
    background-color: #A63737;
  }
  .color-palette div {
    height: 5px;
    width: 10%;
    float: left;
    z-index: 2000;
  }
  .color-palette.color-top {
    top: 0px;
    left: 0px;
  }



  // nav
  // re-declare these here instead of cytosis for faster load
  $base: 22px;
  $border-line: 1px;
  $color-silver-light: #eeeeee;
  $width-xs-max: 767px !default;
  $nav-border: $border-line solid $color-silver-light;

  nav {
    font-size: $base;
    @apply transition ease-in-out hover:ease-in-out;

    a {
      font-size: $base;
      border-bottom: 0;
      text-decoration: none;
      @apply transition ease-in-out hover:ease-in-out;
    }
    a:hover {
      text-decoration: none;
      // font-size: $base * 1.2;
    }

    ._nav-content,
    ._nav-links,
    svg {
      text-align: right;
      vertical-align: middle;
    }
  }



  // down the left
  @media (min-height: 500px) and (min-width: $width-xs-max)  {
    .ContentContainer {
      @apply transition ease-in-out hover:ease-in-out;
      // display: grid;
      // grid-template-columns: 80px auto;
    }

    .ContentNav {
      position: fixed;
      z-index: 10;
    }

    ._nav-content {
      // padding-top: $size-2;
      padding-top: 59px; // align w/ content;
      // position: absolute;
      width: 100%;
      flex: 1 auto;
    }
    // ._nav-logo {
    //   position: fixed;
    // }

    nav {
      // position: fixed;

      height: 100vh;
      grid-column-start: 1;
      grid-column-end: 2;
      border-right: $nav-border;

      display: flex;
      flex-direction: column;
    }


    .ContentFrame-body {
      .Home > * {
        padding-left: 80px;
      }
    }

    ._nav-bottom {
      padding: $base * 0.5;
      text-align: center;
      padding-bottom: $base * 0.5;

      a {
        padding: $base;
      }
    }

    ._nav-logo {
      display: inline-block;
      transform: rotate(-90deg);
      transform-origin: 100%;
      // text-align: right;
      position: relative;
      right: 50%;
      // top: 26px;
    }
  }





    
  // across top

  // @media (max-height: 499px) 
  //        , (max-width: $width-xs-max)  {
  @media (max-width: $width-xs-max)  {

    ._nav-more {
      // white-space: nowrap;
      // margin: 0;
      grid-column-start: 1;

      &:after {
        content: '\2192';
        display: inline-block;
        // padding-left: $base/2;
        margin-left: $base * 0.5;
        margin-right: $base * 2;
      }
    }
    // ._nav-links {
    //   grid-row-start: 2;
    // }
    nav {
      @apply transition ease-in-out hover:ease-in-out;
      margin-top: 4px;
      display: grid;
      grid-template-columns: 1fr 4fr;
      border-bottom: $nav-border;
      align-items: center; 

      ._nav-content {
        padding: $base $base;
        text-align: left;
        // display: grid;
        span, a {
          display: inline-block;
        }
      }
      ._nav-bottom {
        text-align: right;
        padding-right: $base * 2;
        div {
          display: inline-block;
          margin-left: $base;
        }
      }
    }

  }


</style>