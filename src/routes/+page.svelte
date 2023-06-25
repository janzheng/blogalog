<div class="Home">

  <div class="Hero | content-pad | bg-slate-100 | overflow-hidden ">
    <div class="relative container max-w-7xl mx-auto w-full h-full; | md:grid grid-cols-3-2">
      <div>
        <h2 class="antialiased pt-4 pb-8">Hey hey,</h2>
        <h2 class="pt-0 leading-12 antialiased ">I’m Jan, a product designer who combines code, user research, and lean startup methods to tackle complex issues and difficult projects.</h2>
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

    
  </div>

</div>



<!-- <div class="Content-box _content-narrow my-16 mx-auto">
  <LiveNotion blockId={"3934dd0203ae4f96888b835183702c99"} />
</div>  -->

<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  // import LiveNotion from '$lib/components/shared/LiveNotion.svelte';
  import Companies from '$lib/components/Companies.svelte';


  let image, popup=false;

  // onMount(() => {
  //   setTimeout(() => {
  //     image.style.bottom = '0';
  //   }, 100);
  // });

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


