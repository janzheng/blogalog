

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
	import '$src/app.scss'
  import '@fontsource/inter';
  import '@fontsource/inter/600.css';
  import '@fontsource/inter/700.css';
  

  // export let data;
	const transitionIn = { delay: 150, duration: 150 };
	const transitionOut = { duration: 100 };
	// $: currentPage.set(data.path);
  // $user = $page.data?.user || null

</script>
















<!-- root layout does NOT come with a Head! -->
<!-- all Head need to be in a layout group -->

<svelte:head>
  <script defer data-domain="{$page.data.plainUrl},rollup.blogalog.net" src="https://plausible.io/js/script.js"></script>
</svelte:head> 

<Head />

<div id="layout" class="layout"
  >
  <div class="ContentContainer |">
    <main
      class="ContentBody"
      id="main"
      tabindex="-1"
      in:fade={transitionIn}
      out:fade={transitionOut}
    >
      <slot />
    </main>

  </div>
</div>


<style lang="scss" global>

  // .ContentBody {
  //   min-height: calc(100vh - 250px);
  // }

  // set all var definitions here for convenience
  // .layout {
  //   --color-bg-row: teal; // bg-slate-50
  // }





</style>