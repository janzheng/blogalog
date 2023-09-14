

<svelte:head>
  {#if $page?.data.pageContent}
    <title>{marked($page?.data.pageContent?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
</svelte:head>


<!-- {#if $page?.data.isBlogalogHome && !pageContent} -->
{#if $page?.data.isBlogalogHome}
  <!-- blogalog profile / main home pag-->
  <Profile />
{/if}

{#if $page.data.path && $page?.data.pageContent && $page?.data.isBlogalogHome!==true}
  <!-- blog post or sub-page post -->
  <div class="PagePath PageContent content-pad _content-wide">


    <!-- BACK LINK -->
    {#if PUBLIC_BLOGMODE!=='janzheng'}
      <div class="ProfileStack | ">
        <a href={blogPath} style="" class="flex items-center">
          {#if profileImage}
            <div class="ProfileImage |">
              <img class="w-16 h-16 | inline-block | object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
            </div>
          {/if}<div class="text-lg font-medium | inline-block ml-2">{author}</div>
        </a>
      </div>
    {/if}



    {#if pageCover}
      <div class="CoverImage-container | mt-4">
        <img alt="CoverImage header " src="{pageCover}" />
      </div>
    {/if}


    {#if $page?.data.pageContent?.Name}
      <h1 class="PageContent-Name mb-0 pt-2 pb-2">{@html marked($page?.data.pageContent?.Name || '')}</h1>
    {/if}

    {#if $page?.data.pageContent?.Content}
      <div class="PageContent-Content text-xl">{$page?.data.pageContent?.Content}</div>
    {/if}

    {#if $page?.data.pageContent?.Link}
      <div class="PageContent-Link my-4">Project Link: <a href="{$page?.data.pageContent?.Link}">{$page?.data.pageContent?.Link}</a></div>
    {/if}
    
    {#if $page?.data.pageContent?.pageBlocks}
      <div class="PageContent-Blocks post | mt-4 mb-16">
        <Notion classes="notion" loud={true} blocks={$page?.data.pageContent?.pageBlocks} ></Notion>
      </div>
    {/if} 

    <!-- create an html details / summary example here -->
    <!-- skip if only one version -->
    <!-- {#if pageContent && $page?.data.pageContent?.versions && $page?.data.pageContent?.versions.length > 1}
      <div class="PageContent-Versions mt-4">
        <details>
          <summary>Versions</summary>
          {#each $page?.data.pageContent?.versions.slice(1) as version}
            <div class="post-version | mt-4 pl-8">
              <details>
                <summary>
                  {#if version.Version}<span class="text-sm">{version.Version}</span> {/if}
                  {#if version.VersionNotes}<span class="text-sm">{version.VersionNotes}</span>
                  {/if}
                  {#if version.Description}
                    <span class=""> — {version.Description}</span>
                  {/if}
                </summary>
                {#if version.pageBlocks}
                  <div class="pl-8">
                    <Notion classes="notion" blocks={version.pageBlocks}></Notion>
                  </div>
                {/if}
              </details>  
            </div>
          {/each}
        </details>
      </div>
    {/if} -->

  </div>
{/if}



<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import { browser } from '$app/environment'; 
  import { PUBLIC_BLOGMODE } from '$env/static/public';
  import { getNotionImageLink } from '$lib/helpers.js'
  // import Notion from '@yawnxyz/sveltekit-notion'
  // import Notion from '@yawnxyz/sveltekit-notion/src/Notion.svelte'
  import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'

  import Profile from '$lib/components/profiles/Profile.svelte';
  import { plainRenderer } from '$plasmid/utils/marked';

  import { page } from '$app/stores'
  // if(browser)
  //   console.log('-* pageData: ', $page?.data)

  let blogPath, cytosis, pageContent, profileImage, author, pageCover

  $: if($page?.data) {
    blogPath = $page?.data?.pathArr?.length>1 ? `/${$page?.data?.pathArr[0]}` : "/"
    cytosis = $page?.data.cytosis; // await streamed cytosis, and set it here
    pageContent = $page?.data.pageContent
    if (browser) console.log('[path-*] pageContent: ', pageContent)
    profileImage = getNotionImageLink(cytosis?.['site-data']?.['ProfileImage'])
    pageCover = getNotionImageLink(pageContent) || pageContent?.['Cover']
    author = cytosis?.['site-data'].Author?.['Content'];

  }
  // needs to catch both /base/project/post vs. /project/post and go one step up
  
  // $: pageContent = $page?.data.cytosis?.['site-pages'].find(item => item.Path === $page?.data.path || item.Path === $page?.data.pathArr?.[$page?.data.pathArr?.length -1]);
  // if($page?.data.pageContent) pageContent = $page?.data.pageContent



  // if(browser) {
      // console.log('blog path DATA?!?!!??!:', data, pageContent)
  //   (async () => {
  //     cytosis = await $page?.data.streamed?.cytosis
  //     console.log('----> cytosis:', cytosis)
  //   })()
  // }

  // $: if(browser && $page?.data.streamed?.cytosis) {
  //   console.log('streamed.cytosis:', $page?.data.streamed?.cytosis)
  // }

</script>

 

<style lang="scss" global>

  // :root {
  //   // set notion page width to default blogalog page width
  //   --notion-page-width: var(--blogalog-page-width);
  // }
</style>