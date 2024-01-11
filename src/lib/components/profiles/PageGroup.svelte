
<script>

  import { marked } from 'marked'
  import { dev, browser } from '$app/environment'; 
  import { getContext } from 'svelte';
  import { getNotionImageLink } from '$lib/helpers.js'
  
  import RenderProfileRow from '$lib/components/RenderProfileRow.svelte';
  import { plainRenderer } from '$plasmid/utils/marked';



  export let sitePages
  console.log('PageGroup Sitepages', sitePages)


  let blogData = getContext('blogData');
  let blogPath, pageContent, profileImage, author, pageCover;

  if(blogData) {
    blogPath = blogData?.pathSegments?.length>1 ? `/${blogData?.pathSegments[0]}` : "/"
    pageContent = blogData.pageContent
    profileImage = getNotionImageLink(blogData?.blog?.['site-data']?.['ProfileImage'])
    // pageCover = getNotionImageLink(pageContent) || pageContent?.['Cover']
    author = blogData?.blog?.['site-data'].Author?.['Content'];
    if (dev && browser) console.log('[dev][path] pageGroup: ', blogData, pageContent)
  }


</script>










<svelte:head>
  {#if blogData.pageContent}
    <title>{marked(blogData.pageContent?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
  {#if blogData?.pageContent?.['Type'] == 'Component'} 
    <title>{blogData?.head.title}</title>
  {/if}
</svelte:head>


<div class="PageGroup">
  {#each sitePages as page}
    <RenderProfileRow row={page} {blogData} />
  {/each}
</div>