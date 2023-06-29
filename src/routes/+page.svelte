<div class="Home">

  <div class="Hero | content-pad | bg-slate-100 | overflow-hidden ">
    <div class="relative container max-w-7xl mx-auto w-full h-full; | md:grid grid-cols-3-2">
      <div>
        {#if $page.data?.['jz-data']?.['hero'].Content}
          {@html marked($page.data?.['jz-data']?.['hero'].Content || '')}
        {:else}
          <h2 class="antialiased pt-4 pb-8">Hey hey,</h2>
          <h2 class="pt-0 leading-12 antialiased ">I’m Jan, a product designer who combines code, user research, and lean startup methods to tackle complex issues and difficult projects.</h2>
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

    <div class="my-16">
      <Companies ></Companies>
    </div>

    {#if cytosis && cytosis['jz-pages']}
      {#each cytosis['jz-pages'] as post}
        <div class="post | mb-32">
          <Notion blocks={post.pageBlocks}></Notion>
        </div>
      {/each}
    {/if}
    
  </div>

</div>


<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import Companies from '$lib/components/Companies.svelte';
  import { page } from '$app/stores'
  import { browser } from '$app/environment'; 
  import Notion from '@yawnxyz/sveltekit-notion'


  let cytosis // await streamed cytosis, and set it here

  if(browser) {
    (async () => {
      cytosis = await $page.data.streamed?.cytosis
      console.log('----> cytosis:', cytosis)
    })()
  }

  $: if(browser && $page.data.streamed?.cytosis) {
    console.log('streamed.cytosis:', $page.data.streamed?.cytosis)
  }



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


