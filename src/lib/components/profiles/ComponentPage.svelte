

<svelte:head>
  {#if blogData.pageContent}
    <title>{marked(blogData.pageContent?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
  {#if blogData.pageContent['Type'] == 'Component'} 
    <title>{blogData.head.title}</title>
  {/if}
</svelte:head>


<div class="PagePath PageContent PageComponent">
  <div class="ProfileStack | mb-4">
    <a href={blogPath} style="" class="flex items-center">
      {#if profileImage}
        <div class="ProfileImage |">
          <img class="w-16 h-16 | inline-block | object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
        </div>
      {/if}
      <div class="text-lg font-medium | inline-block ml-2">{author}</div>
    </a>
  </div>
  <RenderComponent row={pageContent} />
</div>


<script>

  import { marked } from 'marked'
  import { dev, browser } from '$app/environment'; 
  import { getContext } from 'svelte';
  import { getNotionImageLink } from '$lib/helpers.js'
  
  import RenderComponent from '$lib/components/RenderComponent.svelte';
  import { plainRenderer } from '$plasmid/utils/marked';

  // import { page } from '$app/stores'

  let blogData = getContext('blogData');
  let blogPath, pageContent, profileImage, author, pageCover

  if(blogData) {
    blogPath = blogData?.pathSegments?.length>1 ? `/${blogData?.pathSegments[0]}` : "/"
    pageContent = blogData?.pageContent
    profileImage = getNotionImageLink(blogData?.blog?.['site-data']?.['ProfileImage'])
    pageCover = getNotionImageLink(pageContent) || pageContent?.['Cover']
    author = blogData?.blog?.['site-data'].Author?.['Content'];
    if (dev && browser) console.log('[dev][path] pageContent: ', blogData, pageContent)
  }
  

</script>

 
