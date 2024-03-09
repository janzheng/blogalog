

<script>
  import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
  import { browser, dev } from '$app/environment'; 
	// import { isMenuOpen } from '$lib/stores'
	// import { navItems } from '$lib/config'
  import { page } from '$app/stores'
  // import YAML from 'yaml'
  // import { PUBLIC_PROJECT_NAME, PUBLIC_BLOGMODE } from '$env/static/public';

  import Head from '$lib/components/shared/Head.svelte'
	// import Footer from '$lib/layouts/BlogalogFooter.svelte';


	import '$src/app.scss'
  // import '@fontsource/inter';
  import '@fontsource/inter/400.css';
  import '@fontsource/inter/500.css';
  import '@fontsource/inter/700.css';

  import '@fontsource/nanum-myeongjo/400.css';
  import '@fontsource/nanum-myeongjo/700.css';

  // does this work over tw safelist? which one's smaller + faster?
  import twcdn from '$lib/twcdn';
  

  // export let data;
	const transitionIn = { delay: 150, duration: 150 };
	const transitionOut = { duration: 100 };
	// $: currentPage.set(data.path);
  // $user = $page.data?.user || null

  let plainUrl
  if(browser && page) {
    plainUrl = $page.data.plainUrl
  }

</script>
















<!-- root layout does NOT come with a Head! -->
<!-- all Head need to be in a layout group -->

<svelte:head>
  <script defer data-domain="{plainUrl},rollup.blogalog.net" src="https://plausible.io/js/script.js"></script>
</svelte:head> 

<Head />

<div id="layout" class="layout"
  >
  <div class="ContentContainer | ">
    <main
      class="ContentBody"
      id="main"
      tabindex="-1"
      in:fade={transitionIn}
      out:fade={transitionOut}
    >
      <slot />
    </main>

    <!-- {#if $page.data.hideFooter !== true}
      <Footer bind:clientHeight={heightOfFooter} content={$page.data.blog?.['site-data']?.['Footer']?.Content} />
    {/if} -->
  </div>
</div>

<style lang="scss" global>
  // @import '../app';

  // .ContentBody {
  //   min-height: calc(100vh - 250px);
  // }

  // set all var definitions here for convenience
  // .layout {
  //   --color-bg-row: teal; // bg-slate-50
  // }





</style>