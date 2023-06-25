
<!-- only browser-rendered, since we want this live! 

  options for _contentID: (for Evg2023)
    _notion-announcements
    _notion-live
    _notion-backstage
    _notion-schedule
    _notion-speakers
    _notion-speakers

-->
{#if Notion && blockId}
  <Notion classes={''} loadingMsg={'Loading stream...'} loadingClasses={'font-serif text-2xl text-evg-green-dark'} id={blockId} api={PUBLIC_NOTION_API_URL}/>
{/if}


<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { PUBLIC_NOTION_API_URL } from '$env/static/public';
  import { _content } from '$plasmid/modules/content/store.js'

  // will break prismjs
  // import Notion from '@yawnxyz/sveltekit-notion'
  let Notion // needs to be dynamically imported on use, client-side

  export let contentId = '_notion-live'
  export let blockId = browser && _content(contentId) || '';

	onMount(async () => {
    if (typeof window !== 'undefined') {
      Notion = (await import('@yawnxyz/sveltekit-notion')).default;
    };
	});
</script>




<style type="text/scss">
</style>




