<script>
  // import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  import Loader from '$plasmid/components/icons/loader.svelte';
  
  export let data;
  let isLoading = false;
  let isDone = false;
  let title = data.head?.title
  let message = `Refresh data for: ${title}`;

  async function fetchData() {
    isLoading = true;
    message = 'Queuing refresh...'
    const response = await fetch(`https://www.blogalog.net/api/reload/${data.path}`);
    data = await response.json();
    message = 'Site is Actively Refreshing. Reload the site in ~15s.'
    console.log(data);
    isLoading = false;
    isDone = true;

    setTimeout(() => {
      message = `Refresh data for: ${title}`;
    }, 15000);
  }

  $: if (browser && dev) {
    console.log('[dev] Page Data:', data)
  }
   
</script>


<div class="Deploy | ">
  {#if isLoading}
    <div class="Deploy-loading">
      <Loader /> 
      <div class="inline-block pl-6 font-sans font-2xl inline-block">{message}</div>
    </div>
  {:else if isDone}
    <div class="Deploy-done">
      <button class="Btn-solid" on:click={fetchData}>
        Refresh Page
      </button>
      {#if message}
        <div class="inline-block pl-6 font-sans font-2xl inline-block">{message}</div>
      {/if}
    </div>
  {:else}
    <button class="Btn-solid" on:click={fetchData}>
      Refresh Page
    </button>
      {#if message}
        <div class="inline-block pl-6 font-sans font-2xl inline-block">{message}</div>
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