<script>
  import { PUBLIC_PROJECT_NAME, PUBLIC_FUZZYKEY_URL } from '$env/static/public';

  // import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  import Loader from '$plasmid/components/icons/loader.svelte';
  
  export let data;
  let blogPath = data.path
  let isLoading = false;
  let isDone = false;
  let title = data.head?.title
  let counter = 0
  // let message = `Refresh data for: ${title} | ${blogPath}`;
  let message = `Refresh [${blogPath}]`;

  async function fetchData() {
    isLoading = true;
    message = 'Queuing refresh...'
    const response = await fetch(`/api/reload/${blogPath}?pageDataId=${data.blog?.pageDataId}`);
    // const response = await fetch(`https://www.blogalog.net/api/reload/${data.path}`);
    data = {...data, ...await response.json()};
    console.log('deploy/fetchData:', data);
    isLoading = false;
    isDone = true;
    counter = 0;

    pollData();

    // setTimeout(() => {
    //   message = `Refresh data for: ${title}`;
    // }, 15000);
  }

  $: if (browser && dev) {
    console.log('[dev] Page Data:', data)
  }



  let intervalId, timeCounter;

  async function pollData() {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
      clearInterval(timeCounter);
    }

    // Store the initial metadata.created value
    let initialCreated = data?.created;

    // Start polling every 3 seconds
    intervalId = setInterval(async () => {
      const response = await fetch(`${PUBLIC_FUZZYKEY_URL}/?metadata=true&key=${PUBLIC_PROJECT_NAME}-${blogPath}`);
      const newData = await response.json();
      console.log('checking...', `${PUBLIC_FUZZYKEY_URL}/?metadata=true&key=${PUBLIC_PROJECT_NAME}-${blogPath}`, initialCreated, newData, newData?.metadata?.created)
      // If metadata.created has changed, clear the interval and update the message
      if (newData?.metadata?.created && newData?.metadata?.created !== initialCreated) {
        clearInterval(intervalId);
        clearInterval(timeCounter);
        message = `Refresh successful for [${blogPath}]`;
      }
    }, 3000);


    timeCounter = setInterval(async () => {
      counter += 1
      message = `Site is rebuilding... ${counter}s`
    }, 1000)
  }
   


  import { onDestroy } from 'svelte';

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
</script>

<div class="Refresher | ">
  {#if isLoading}
    <div class="Refresher-loading">
      <div class="Btn-outline inline-block pl-6 font-2xl inline-block text-gray-500 border-gray-200 cursor-default hover:bg-white hover:border-gray-200">
        <Loader /> {message}
      </div>
    </div>
  {:else if isDone}
    <div class="Refresher-done">
      <button class="Btn-solid" on:click={fetchData}>
        {message}
      </button>
    </div>
  {:else}
    <button class="Btn-solid" on:click={fetchData}>
      {message}
    </button>
    <!-- {#if message}
      <div class="inline-block pl-6 font-2xl inline-block">{message}</div>
    {/if} -->
  {/if}
</div>



<style lang="scss" global>

  .content-notion-wide {
    max-width: var(--blogalog-page-width, 704px);
    margin-left: auto;
    margin-right: auto;
  }

</style>