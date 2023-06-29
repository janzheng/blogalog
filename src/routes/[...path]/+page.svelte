


{#if pageContent}
  <div class="PageContent content-pad _content-wide">

    {#if pageContent.Name}
      <h1 class="mb-0 pb-2">{@html marked(pageContent.Name || 'woof')}</h1>
    {/if}

    {#if pageContent.Description}
      <div class="text-xl">{pageContent.Description}</div>
    {/if}

    {#if pageContent.pageBlocks}
        <div class="post | mt-16 mb-32">
          <Notion blocks={pageContent.pageBlocks}></Notion>
        </div>
    {/if}

  </div>  

{/if}


<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import { page } from '$app/stores'
  import { browser } from '$app/environment'; 
  import Notion from '@yawnxyz/sveltekit-notion'

  let cytosis; // await streamed cytosis, and set it here
  let pageContent = $page.data.pageContent;

  // if(browser) {
  //   (async () => {
  //     cytosis = await $page.data.streamed?.cytosis
  //     console.log('----> cytosis:', cytosis)
  //   })()
  // }

  // $: if(browser && $page.data.streamed?.cytosis) {
  //   console.log('streamed.cytosis:', $page.data.streamed?.cytosis)
  // }



</script>

 

<style lang="scss" global>

  .notion-page { 
    margin-left: 0; // left-align
  }
</style>