

<svelte:head>
  <!-- this is wrong; has to be served from ssr, but too lazy -->
  <title>{pageContent?.Name}</title>
</svelte:head>


{#if pageContent}
  <div class="PageContent content-pad _content-wide">

    {#if PUBLIC_CY_TYPE!=='janzheng'}
      <div class="ProfileStack | ">
        <a href="/" class="hover:no-underline">
          {#if profileImage}
            <div class="ProfileImage |">
              <img class="w-16 h-16 | inline-block | object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
              <div class="text-lg font-medium | inline-block ml-2">{author}</div>
            </div>
          {/if}
        </a>
      </div>
    {/if}


    {#if pageContent?.Cover}
      <div class="CoverImage">
        <img alt="CoverImage header" src="{pageContent?.Cover}" />
      </div>
    {/if}

    {#if pageContent?.Name}
      <h1 class="mb-0 pb-2">{@html marked(pageContent?.Name || '')}</h1>
    {/if}

    {#if pageContent?.Description}
      <div class="text-xl">{pageContent?.Description}</div>
    {/if}

    {#if pageContent?.Link}
      <div class="my-4">Project Link: <a href="{pageContent?.Link}">{pageContent?.Link}</a></div>
    {/if}

    {#if pageContent?.pageBlocks}
        <div class="post | mt-16 mb-16">
          <Notion blocks={pageContent?.pageBlocks}></Notion>
        </div>
    {/if}


    <!-- create an html details / summary example here -->
    {#if pageContent?.versions}
      <div class="mt-4">
        <details>
          <summary>Versions</summary>
          {#each pageContent?.versions as version}
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
                <div class="pl-8">
                  <Notion blocks={version.pageBlocks}></Notion>
                </div>
              </details>  
            </div>
          {/each}
        </details>
      </div>
    {/if}

  </div>
{/if}


<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import { page } from '$app/stores'
  import { browser } from '$app/environment'; 
  import { PUBLIC_CY_TYPE } from '$env/static/public';
  import Notion from '@yawnxyz/sveltekit-notion'

  let cytosis = $page.data.cytosis; // await streamed cytosis, and set it here
  // let pageContent = $page.data.pageContent;
  let pageContent = $page.data.cytosis['site-pages'].find(item => item.Path === $page.data.path);

  let profileImage = cytosis?.['site-data']?.['ProfileImage'].Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url;
  let author = cytosis?.['site-data'].Author?.['Content'];
  // if(browser) {
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

  .notion-page { 
    margin-left: 0; // left-align
  }
</style>