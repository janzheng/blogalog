<script>
  import { dev, browser } from '$app/environment';
  import Refresher from '$lib/components/Refresher.svelte';
  
  export let data;

  // console.log('init data::', data)
  let blogPath = data.path
  let isLoading = false;
  let isDone = false;
  let title = data.head?.title
  let counter = 0
  let message = `Refresh data for: ${title} | ${blogPath}`;

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



  let timeCounterInterval, cacheCheckInterval;

  async function pollData() {
    // Clear any existing interval
    if (cacheCheckInterval) {
      clearInterval(cacheCheckInterval);
      clearInterval(timeCounterInterval);
    }

    // Store the initial metadata.created value
    let initialCreated = data?.created;

    // Start polling every 3 seconds
    cacheCheckInterval = setInterval(async () => {
      const response = await fetch(`${PUBLIC_FUZZYKEY_URL}/?metadata=true&key=${PUBLIC_PROJECT_NAME}-${blogPath}`);
      const newData = await response.json();
      console.log('checking...', `${PUBLIC_FUZZYKEY_URL}/?metadata=true&key=${PUBLIC_PROJECT_NAME}-${blogPath}`, initialCreated, newData, newData?.metadata?.created)
      // If metadata.created has changed, clear the interval and update the message
      if (newData?.metadata?.created && newData?.metadata?.created !== initialCreated) {
        clearInterval(cacheCheckInterval);
        clearInterval(timeCounterInterval);
        message = `Refresh successful for ${title}`;
      }
    }, 3000);


    let timeCounter = setInterval(async () => {
      counter += 1
      message = `Site is rebuilding... ${counter}s`
    }, 1000)
  }
   


  import { onDestroy } from 'svelte';

  onDestroy(() => {
    if (cacheCheckInterval) {
      clearInterval(cacheCheckInterval);
    }
  });
</script>

<div class="Deploy">
  <Refresher {data} />
</div>
