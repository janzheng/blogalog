

<svelte:head>
  {#if pageContent}
    <title>{pageContent?.Name}</title>
  {/if}
</svelte:head>


<!-- {#if $page.data.isBlogalogHome && !pageContent} -->
{#if $page.data.isBlogalogHome}
  <!-- blogalog profile / main home pag-->
  <Profile />

{:else if pageContent}
  <!-- 

    THIS IS KIND OF DEFUNCT: Works for "janzhen.com"
    Takes the .versions thing and bring that into Profile

  -->
  <!-- blog post or sub-page post -->
  <div class="PagePath PageContent content-pad _content-wide">

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

 
    {#if pageContent?.Cover}
      <div class="CoverImage-container | mt-4">
        <img alt="CoverImage header " src="{pageContent?.Cover}" />
      </div>
    {/if}

    {#if pageContent?.Name}
      <h1 class="PageContent-Name mb-0 pt-2 pb-2">{@html marked(pageContent?.Name || '')}</h1>
    {/if}

    {#if pageContent?.Content}
      <div class="PageContent-Content text-xl">{pageContent?.Content}</div>
    {/if}

    {#if pageContent?.Link}
      <div class="PageContent-Link my-4">Project Link: <a href="{pageContent?.Link}">{pageContent?.Link}</a></div>
    {/if}
    
    {#if pageContent?.pageBlocks}
      <div class="PageContent-Blocks post | mt-4 mb-16">
        <Notion classes="notion" loud={true} blocks={pageContent?.pageBlocks} ></Notion>
      </div>
    {/if}


    <!-- create an html details / summary example here -->
    <!-- skip if only one version -->
    <!-- {#if pageContent && pageContent?.versions && pageContent?.versions.length > 1}
      <div class="PageContent-Versions mt-4">
        <details>
          <summary>Versions</summary>
          {#each pageContent?.versions.slice(1) as version}
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
  import Notion from '@yawnxyz/sveltekit-notion'
  // import Notion from '@yawnxyz/sveltekit-notion/src/Notion.svelte'
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'

  import Profile from '$lib/components/profiles/Profile.svelte';

  import { page } from '$app/stores'
  // if(browser)
  //   console.log('-* pageData: ', $page.data)

  // needs to catch both /base/project/post vs. /project/post and go one step up
  let blogPath = $page.data?.pathArr?.length>1 ? `/${$page.data?.pathArr[0]}` : "/"
  
  let cytosis = $page.data.cytosis; // await streamed cytosis, and set it here
  // let pageContent = $page.data.pageContent;
  let pageContent = $page.data.pageContent
  // $: pageContent = $page.data.cytosis?.['site-pages'].find(item => item.Path === $page.data.path || item.Path === $page.data.pathArr?.[$page.data.pathArr?.length -1]);
  // if (browser) console.log('-* pageContent: ', pageContent)


  let profileImage = cytosis?.['site-data']?.['ProfileImage']?.Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url;
  let author = cytosis?.['site-data'].Author?.['Content'];
  // if(browser) {
      // console.log('blog path DATA?!?!!??!:', data, pageContent)
  //   (async () => {
  //     cytosis = await $page.data.streamed?.cytosis
  //     console.log('----> cytosis:', cytosis)
  //   })()
  // }

  // $: if(browser && $page.data.streamed?.cytosis) {
  //   console.log('streamed.cytosis:', $page.data.streamed?.cytosis)
  // }

</script>

 

<style lang="scss" global>

  .PagePath {
    // max-width: var(--notion-page-width);
    @apply relative container max-w-4xl mx-auto w-full h-full;
  }

  .PagePath .notion-page { 
    margin-left: 0; // left-align
    width: 100%;
    max-width: 100%;
  }
</style>