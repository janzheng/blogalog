<script>
  // import { onMount } from 'svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  
  export let data;
  let isLoading = false;
  let isDone = false;

  async function fetchData() {
    isLoading = true;
    const response = await fetch(`https://www.blogalog.net/api/reload/${data.path}`);
    data = await response.json();
    console.log(data);
    isLoading = false;
    isDone = true;
  }
</script>


<div class="Deploy | content-notion-wide mx-auto my-6">
  {#if isLoading}
    <div class="Deploy-loading">
      <Loader /> 
      <h2 style="padding-top:0">Loading...</h2>
    </div>
  {:else if isDone}
    <div class="Deploy-done">
      <h2 style="padding-top:0">Site Reloaded!</h2>
    </div>
  {:else}
    <button class="Btn-solid" on:click={fetchData}>
      Refresh Page
    </button>
  {/if}
</div>



<style lang="scss" global>

  .content-notion-wide {
    max-width: var(--blogalog-page-width, 704px);
    margin-left: auto;
    margin-right: auto;
  }

</style>