<script>
  // import { onMount } from 'svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  
  export let data;
  let isLoading = false;
  let isDone = false;

  console.log('data path:', data);

  async function fetchData() {
    isLoading = true;
    const response = await fetch(`http://blogalog.net/api/reload/${data.path}`);
    data = await response.json();
    console.log(data);
    isLoading = false;
    isDone = true;
  }
</script>


<div class="Deploy | content-notion-wide mx-auto my-24">
  {#if isLoading}
    <div class="GridItems-loading">
      <Loader /> 
      <h2 style="padding-top:0">Loading...</h2>
    </div>
  {:else if isDone}
    <div class="GridItems-done">
      <h2 style="padding-top:0">Done loading!</h2>
    </div>
  {:else}
    <button class="Btn-solid" on:click={fetchData}>
      Fetch Data
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