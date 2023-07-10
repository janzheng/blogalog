
<div class="Header | content-notion-wide | sm:mt-4 lg:mt-8 rounded-sm overflow-hidden  ">
  <!-- cover -->
  {#if coverImage}
    <div class="CoverImage bg-slate-100">
      <img class="w-full md:h-64 object-left-top object-contain" src="{coverImage}" alt="Cover" />
    </div>
  {/if}
  
  <!-- profile -->
  {#if profileImage}
    <div class="ProfileImage | px-4 | md:absolute md:z-10 | md:-mt-32 sm:py-4 | bg-slate-100 md:bg-inherit">
      <img class="w-32 h-32 | object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
      <div class="ProfileShortDesc | xs:inline-block xs:absolute xs:-mt-24 md:-mt-20 xs:ml-36 md:w-96">
        <div class="text-xl md:text-4xl font-bold py-2">{author||''}</div>
        <div class="text ">{siteDesc||''}</div>
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



{#if cytosis && cytosis['site-pages']}
  <div class="Posts | my-16 | content-notion-wider | overflow-hidden ">
    <Posts posts={cytosis['site-pages'].filter(page => page.Type == "Post")} ></Posts>
  </div>
{/if}

{#if mainPageBlocks}
  <div class="MainPage | content-pad | overflow-hidden ">
    <!-- main area -->
    <Notion blocks={mainPageBlocks}></Notion>
  </div>
{/if}



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
  let mainPageBlocks = cytosis?.['site-pages'].find(page => page.Type?.includes("MainPage"))?.pageBlocks;

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
</style>