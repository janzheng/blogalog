<div class="Home">

  {#if PUBLIC_BLOGMODE !== "janzheng"}
    <Profile />
  {:else}
    <!-- janzheng.com custom pages -->
    <script defer data-domain="janzheng.com" src="https://plausible.io/js/script.js"></script>
    <div class="Hero | content-pad | bg-slate-100 | overflow-hidden ">
      <div class="relative container max-w-7xl mx-auto w-full h-full; | md:grid grid-cols-3-2">
        <div>
          {#if false && cytosis['site-data']?.['hero']?.Content}
            {@html marked(cytosis['site-data']?.['hero']?.Content || '')}
          {:else}
            <h2 class="h2-1 antialiased pt-4 pb- mb-0" >Hey hey,</h2>
            <h2 class="h2-2 pt-0 leading-12 antialiased">I’m Jan, a product designer who uses code and good product design practices to tackle challenging, data-centric problems.</h2>
          {/if}
        </div>
        <div class="relative">
          <div id="me-container" on:click={handleClick} on:keypress={handleClick}>
            <img alt="me.png" bind:this={image} id="slideImage" src="jan-zheng-pop.png" />
          </div>
        </div>
      </div>
    </div>

    <div class="content-pad _content-wide">
      {#if cytosis && cytosis[1]}
        <div class="my-16">
          <!-- <Posts posts={cytosis['site-pages'].filter(page => page.Type == "Posts")} ></Posts> -->
          <Posts posts={cytosis[1].filter(page => page.Type == "Posts")} ></Posts>
        </div>
      {/if}
      <div class="my-16">
        <Companies ></Companies>
      </div>

      <!-- {#if cytosis && cytosis['site-pages']}
        <div class="my-16">
          <CaseStudies caseStudies={cytosis['site-pages'].filter(page => page.Type == "Case Study")} ></CaseStudies>
        </div>
      {/if} -->
      
    </div>
  {/if}

</div>


<script>

  import { marked } from 'marked'
	// import { onMount } from 'svelte';
  import { page } from '$app/stores'
  import { browser } from '$app/environment'; 
  // import Notion from '@yawnxyz/sveltekit-notion'
  import { PUBLIC_BLOGMODE } from '$env/static/public';
  
  import Profile from '$lib/components/profiles/Profile.svelte';
  import Companies from '$lib/components/Companies.svelte';
  // import CaseStudies from '$lib/components/CaseStudies.svelte';
  import Posts from '$lib/components/Posts.svelte';

  let cytosis = $page.data.cytosis // doesn't wait
  // streamed cytosis (loads in after page loads)
  // if(browser) {
  //   (async () => {
  //     console.log('----> streamed:', $page.data.streamed)
  //     // cytosis = await $page.data.streamed?.cytosis
  //     // console.log('----> cytosis:', cytosis)
  //   })()
  // }

  // $: if(browser && $page.data.streamed?.cytosis) {
  //   console.log('streamed.cytosis:', $page.data.streamed?.cytosis)
  // }



  let image, popup=false;

  function handleClick() {
    if(!popup)
      image.style.bottom = '0';
    else
      image.style.bottom = '';
      
    popup=!popup
  }

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

  #me-container {
    position: absolute;
    height: 200px;
    width: 200px;
    // overflow: hidden;

    @apply -bottom-0 md:-bottom-0 -mb-8;
  }

  #slideImage {
    cursor: pointer;
    position: absolute;
    bottom: -100%;
    transition: bottom .24s ease-out;

    @apply md:hover:-bottom-[80%];

    // &:hover {
    //   bottom: -80%;
    // }
  }

</style>


