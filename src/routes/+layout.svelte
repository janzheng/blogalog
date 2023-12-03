

<script>
  import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
  import { browser, dev } from '$app/environment'; 
	// import { isMenuOpen } from '$lib/stores'
	// import { navItems } from '$lib/config'
  import { page } from '$app/stores'
  import { PUBLIC_PROJECT_NAME, PUBLIC_BLOGMODE } from '$env/static/public';

  import Head from '$lib/components/shared/Head.svelte'
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
  $: if(dev && browser) console.log('[dev][routes][+layout.svelte] $page.data:', $page.data, $page.data.blog)

  let heightOfFooter
</script>
















<!-- root layout does NOT come with a Head! -->
<!-- all Head need to be in a layout group -->

<svelte:head>
  <script defer data-domain="{$page.data.plainUrl},rollup.blogalog.net" src="https://plausible.io/js/script.js"></script>
</svelte:head> 

<Head />

<div id="layout" class="layout {"project-"+PUBLIC_PROJECT_NAME}  {layoutStyle}" >
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

    {#if $page.data.hideFooter !== true}
      <!-- this can be sent from page.server -->
      <Footer bind:clientHeight={heightOfFooter} content={$page.data.blog?.['site-data']?.['Footer']?.Content} />
    {/if}
  </div>
</div>


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
  // re-declare these here instead of blog for faster load
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