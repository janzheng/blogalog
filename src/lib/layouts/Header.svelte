
<script>
	import { onMount } from "svelte";
	import { browser } from '$app/environment';

	import { isMenuOpen } from '$lib/store'
	import { page } from '$app/stores';
	import logo from './svelte-logo.svg';

	// import Navbar from '$lib/components/sidekit/navbar.svelte';
	// import Subnav from '$lib/components/sidekit/subnav.svelte';
	// import SubnavMobile from '$lib/components/sidekit/sidenav.svelte';

	// import Desktop from '$lib/components/shared/MenuDesktop.svelte';
	// import Mobile from '$lib/components/shared/MenuMobile.svelte';
  

	onMount(async () => {
		if (browser) {
			await import("tw-elements");
		}
	})	

  // export let isMobileNavOpen = false
</script>


<!-- <header id="navbar" class="_content pb-0">
  <Navbar bind:isMenuOpen={$isMenuOpen} useMobileMenu={true} >
  </Navbar>
</header>
<div class="_content py-2">
  <Subnav show={true}></Subnav>
</div> -->

<!-- collapsible mobile nav — kept separate from subnav for optionality -->
<!-- <div
  id="navbar-menu"
  class="accordion-collapse collapse px-2 | sm:hidden"
  class:show={$isMenuOpen}
  data-bs-parent="#navbar"
>
  <SubnavMobile></SubnavMobile>
</div> -->



<!-- <Desktop {logo} {page} /> -->
<!-- <Mobile {logo} {page} /> -->

<!-- 
<style lang="postcss">
  /* .popover__menu {
    @apply bg-white shadow-md rounded-md p-2 w-32;
  } */
</style> -->
