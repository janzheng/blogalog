
<div class="Header | content-notion-wide  ">
  <!-- cover -->
  {#if coverImage}
    <div class="CoverImage bg-slate-100">
      <img class="w-full h-64 object-left-top object-contain" src="{coverImage}" alt="Cover" />
    </div>
  {/if}
  
  <!-- profile -->
  {#if profileImage}
    <div class="ProfileImage | pl-4 | absolute z-10 | bg-slate-100">
      <img class="w-32 h-32 -mt-32 |  
        object-cover rounded-full border-solid border-4 border-white" src="{profileImage}" alt="Profile" />
    </div>
  {/if}

  <div class="bg-slate-100 p-4 content-notion-wide">
    <!-- profile area -->
    {#if socialDescription}
      <div class="my-4">
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
  let socialDescription = cytosis?.['site-data'].SocialDescription?.['Content'];
  let shortDescription = cytosis?.['site-data'].Short?.['Content'];
  let mainPageBlocks = cytosis?.['site-pages'].find(page => page.Type?.includes("MainPage"))?.pageBlocks;

</script>


<style lang="scss">

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
</style>