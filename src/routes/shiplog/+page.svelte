<div class="Home">


  <div class="content-pad _content-wide">

    {#if cytosis && cytosis['site-pages']}
      <div class="my-16">
        <Posts posts={cytosis['site-pages'].filter(page => page.Type == "Post")} ></Posts>
      </div>

      <!-- {#each cytosis['site-pages'] as post}
        <div class="post | mb-32">
          <Notion blocks={post.pageBlocks}></Notion>
        </div>
      {/each} -->
    {/if}

    <div class="my-16">
      <Companies ></Companies>
    </div>

    {#if cytosis && cytosis['site-pages']}
      <div class="my-16">
        <CaseStudies caseStudies={cytosis['site-pages'].filter(page => page.Type == "Case Study")} ></CaseStudies>
      </div>

      <!-- {#each cytosis['site-pages'] as post}
        <div class="post | mb-32">
          <Notion blocks={post.pageBlocks}></Notion>
        </div>
      {/each} -->
    {/if}
    
  </div>

  <!-- <Notion id={"8ebb6e62e9b64d988d2ee435cc5c740d"}></Notion> -->
  

</div>


<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import { page } from '$app/stores'
  import { browser } from '$app/environment'; 
  import Notion from '@yawnxyz/sveltekit-notion'
  
  let cytosis = $page.data.cytosis // doesn't wait



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


