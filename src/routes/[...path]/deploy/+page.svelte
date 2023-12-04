<script>
  // import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  import Loader from '$plasmid/components/icons/loader.svelte';
  
  export let data;
  let isLoading = false;
  let isDone = false;
  let message = `Refresh data for: ${data.head?.title}`;

  async function fetchData() {
    isLoading = true;
    message = 'Queuing refresh...'
    const response = await fetch(`https://www.blogalog.net/api/reload/${data.path}`);
    message = 'Site is refreshing. Check the site in ~15s.'
    data = await response.json();
    console.log(data);
    isLoading = false;
    isDone = true;
  }


  $: if (browser && dev) {
    console.log('[dev] Page Data:', data)
  }
   
</script>


<div class="Deploy | ">
  {#if isLoading}
    <div class="Deploy-loading">
      <Loader /> 
      <div class="font-sans font-2xl inline-block">{message}</div>
    </div>
  {:else if isDone}
    <div class="Deploy-done">
      <button class="Btn-solid" on:click={fetchData}>
        Refresh Page
      </button>
      {#if message}
        <div class="font-sans font-2xl inline-block">{message}</div>
      {/if}
    </div>
  {:else}
    <button class="Btn-solid" on:click={fetchData}>
      Refresh Page
    </button>
      {#if message}
        <div class="font-sans font-2xl inline-block">{message}</div>
      {/if}
  {/if}
</div>



<style lang="scss" global>

  .content-notion-wide {
    max-width: var(--blogalog-page-width, 704px);
    margin-left: auto;
    margin-right: auto;
  }

</style>