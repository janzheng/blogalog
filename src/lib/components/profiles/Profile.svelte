
<div class="Header | content-notion-wide | sm:mt-4 lg:mt-8 rounded-sm overflow-hidden  ">
  <!-- cover -->
  {#if coverImage}
    <div class="CoverImage bg-slate-100">
      <img class="w-full md:h-64 object-left-top object-contain bg-slate-100" src="{coverImage}" alt="Cover" />
    </div>
  {/if}
  
  <!-- profile -->
  {#if profileImage}
  <div class="ProfileImage-Container | relative py-4 bg-slate-100 ">
    <div class="ProfileImage | px-4 | relative md:absolute z-20 | -mt-16 md:-mt-32 md:pb-8 |  ">
      <img class="w-32 h-32 | bg-white object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
      <div class="ProfileShortDesc | sm:inline-block sm:absolute sm:-mt-24 md:-mt-20 sm:ml-36 md:w-96">
        <div class="text-2xl sm:text-4xl font-bold py-2">{author||''}</div>
        <div class="text ">{siteDesc||''}</div>
      </div>
    </div>
  </div>
  {/if}

  <div class="bg-slate-100 p-4 content-notion-wide">
    <!-- profile area -->
    {#if socialDescription}
      <div class="mb-4">
        {@html marked(socialDescription || '')}
      </div>
    {/if}
    {#if shortDescription}
      {@html marked(shortDescription || '')}
    {/if}
  </div>
</div>

<!-- display posts before anything else -->
{#if cytosis && cytosis['site-pages']}
  <div class="Posts | my-2 | content-notion-wide | overflow-hidden ">
    <div class="p-4 bg-slate-50">
      <h2 class="pt-0 mt-0">{"Posts"}</h2>
      <Posts posts={cytosis['site-pages'].filter(page => page.Type == "Posts")} path={blogpath}></Posts>
    </div>
  </div>
{/if}


{#each sitePages as page}
  <div class="TypeSection | my-2 content-notion-wide | overflow-hidden | ">
    {#if page.Type=='Main'}
      <div class="MainPage | p-4 bg-slate-50 ">
        <h2 class="pt-0 mt-0">{page.Name}</h2>
        <Notion blocks={page.pageBlocks} api="//notion-cloudflare-worker.yawnxyz.workers.dev"></Notion>
      </div>
    {:else if page.Type=='Posts'}
      <!-- do nothing; these are displayed elsewhere -->
      <!-- <div class="TypeContainer | p-4 bg-slate-50">
        <h4 class="pt-0 mt-0">{page.Name}</h4>
      </div> -->
    {/if}
  </div>
{/each}


<!-- 
{#each sitePageTypes as type}
  <div class="TypeSection | my-2 content-notion-wide | overflow-hidden | ">
    {#if type=='Main'}
      <div class="MainPage | p-4 bg-slate-50 ">
        <h2 class="pt-0 mt-0">{type}</h2>
        <Notion blocks={mainPageBlocks} api="//notion-cloudflare-worker.yawnxyz.workers.dev"></Notion>
      </div>
    {:else}
      <div class="TypeContainer | p-4 bg-slate-50">
        <h2 class="pt-0 mt-0">{type}</h2>
      </div>
    {/if}
  </div>
{/each} -->



<!-- 
{#if mainPageBlocks}
  <div class="MainPage | content-pad | overflow-hidden ">
    <Notion blocks={mainPageBlocks} api="//notion-cloudflare-worker.yawnxyz.workers.dev"></Notion>
  </div>
{/if} -->



<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  import { page } from '$app/stores';

  import { marked } from 'marked';

  import Posts from '$lib/components/Posts.svelte';

  let cytosis = $page.data.cytosis;
  let profileImage = cytosis?.['site-data']?.['ProfileImage'].Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url;
  let coverImage = cytosis?.['site-data']?.['CoverImage'].Content || cytosis?.['site-data']?.['CoverImage'].Files?.[0].url;
  let author = cytosis?.['site-data'].Author?.['Content'];
  let siteDesc = cytosis?.['site-data'].SiteDescription?.['Content'];
  let socialDescription = cytosis?.['site-data'].SocialDescription?.['Content'];
  let shortDescription = cytosis?.['site-data'].Short?.['Content'];
  let mainPageBlocks = cytosis?.['site-pages'].find(page => page.Type?.includes("Main"))?.pageBlocks;
  let sitePages = cytosis?.['site-pages'];
  let blogpath = $page.data?.path ? `/${$page.data?.path}/` : "/"

  let sitePageByType = {}, sitePageTypes = [];
  cytosis?.['site-pages'].forEach(page => {
    sitePageTypes = [...sitePageTypes, ...page.Type];
    if(!sitePageByType[page.Type]) {
      sitePageByType[page.Type] = [];
    }
    sitePageByType[page.Type].push(page);
  });
  sitePageTypes = [...new Set(sitePageTypes)]; 

  console.log('sitePageByType:', sitePageByType, sitePageTypes);

</script>


<style lang="scss" global>

  .content-pad {
    @apply px-8 md:px-32 py-8 mx-auto;
    // max-width: var(--notion-page-width);
  }

  .content-notion-wide {
    max-width: var(--notion-page-width);
    margin-left: auto;
    margin-right: auto;
  }

  .content-notion-wider {
    max-width: calc(var(--notion-page-width) + 224px);
    margin-left: auto;
    margin-right: auto;
  }
  .notion-callout-icon {
    align-self: flex-start;
  }
  .notion-page-icon {
    font-size: 1.7rem;;
  }


  .MainPage {
    h2, h3, h4 {
      &:first-of-type {
        padding-top: 0; // skip padding for first header keeps it tighter
      }
    }
  }
</style>