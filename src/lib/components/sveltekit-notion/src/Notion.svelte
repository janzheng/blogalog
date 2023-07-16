<script>
	import { browser } from '$app/environment';
  import { onMount } from "svelte";

  import "./styles.css";
  import Render from "./subcomponents/Render.svelte";
  export let fullPage = false;
  export let api = "//notion-cloudflare-worker.yawnxyz.workers.dev";
  // let api = "http://127.0.0.1:8787";
  export let id = null,
    doRender = true;

  // console.log('id:', id)
  // if id includes url, only get the id
  if (id && id.includes("http")) {
    id = id.split("-").pop();
    // console.log('id stripped:', id)
  }
    

  export let classes, loadingClasses,
    loadingMsg = "Loading ...",
    headers = null,
    type = "page",
    results = null,
    loud = false,
    blocks = null;

  let request = undefined;
  if (browser && !blocks) {
    if (loud) console.log(`[svelte-notion] ${api}/v1/${type}/${id}`);

    try {
      request = fetch(`${api}/v1/${type}/${id}`, headers)
        .then((res) => res.json())
        .then((json) => {
          results = json;
          return Object.values(json).map((el) => el.value);
        })
        .then((json) => {
          if (type == "page") {
            blocks = json;
            // page = blocks.find(el => el.type == 'page')
          }
          return json;
        });
    } catch (e) {
      console.error(
        `[svelte-notion] Unable to fetch endpoint: ${api}/v1/${type}/${id}`
      );
    }
  } else {
    // server-side: silent
    if (loud) console.log(`[svelte-notion] blocks imported`);
  }

</script>

<style>
  /* div {
    max-width: 708px;
    margin: 0 auto;
    padding: 0 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica,
      'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji',
      'Segoe UI Symbol';
  } */

</style>

<div class={classes}>
  {#if (id||blocks) && doRender}
    {#if blocks}
      <Render
        {fullPage}
        {blocks}
        {api}
        block={blocks.find((el) => el.type == 'page')} />
    {:else if id && browser && type == 'page'}
      {#await request}
        <div class="Notion-loading {loadingClasses}">
          {@html loadingMsg}
        </div>
      {:then blocks}
        <!-- svelte-specific -->
        <Render
          {fullPage}
          {blocks}
          {api}
          block={blocks.find((el) => el.type == 'page')} />
      {:catch error}
        An error occurred trying to fetch: [{api}/v1/page/{id}]
        <br /><br />
        Error message:
        {error}
      {/await}
    {:else}
      <!-- can only render in the browser; silent on server -->
    {/if}
  {/if}
</div>
