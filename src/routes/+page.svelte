
<!-- LANDING PAGE // PROFILE PAGE
  e.g.  https://jess.bio
        https://blogalog.net // localhost:3055 - catch-all landing page
-->
{#if browser}
<div class="Root | ">
  <!-- main profile page, e.g. jessbio or blogalog.net -->
  <Blogalog isHomepage={true} {page} />
</div>
{/if}







<script>

  import { marked } from 'marked'
	// import { onMount } from 'svelte';
  import { page } from '$app/stores'
  import { dev, browser } from '$app/environment'; 

  import Blogalog from '$lib/components/Blogalog.svelte';

  // import { browser } from '$app/environment'; 
  // // import Notion from '@yawnxyz/sveltekit-notion'
  // import { PUBLIC_BLOGMODE } from '$env/static/public';
  
  // import Profile from '$lib/components/profiles/ProfilePage.svelte';
  // let blog = $page.data.blog; // doesn't wait
  // // streamed blog (loads in after page loads)
  // // if(browser) {
  // //   (async () => {
  // //     console.log('----> streamed:', $page.data.streamed)
  // //     // blog = await $page.data.streamed?.blog
  // //     // console.log('----> blog:', blog)
  // //   })()
  // // }

  // // $: if(browser && $page.data.streamed?.blog) {
  // //   console.log('streamed.blog:', $page.data.streamed?.blog)
  // // }

</script>

 



<style lang="scss" global>

  .h2-1 {
    font-weight: 300 !important; 
    margin-bottom: 0 !important;
  }
  .h2-2 {
    padding-top: 0 !important; 
    font-weight: 300  !important;
  }

  // Notion Pages 
  #_block-e6bbf137-2947-4a6a-9aee-bdcb448d1339 {
    // h2 block in intro Notion
    padding-top: 0 !important;
  }


</style>


