

<svelte:head>
  {#if $page?.data?.pageContent}
    <title>{marked($page?.data?.pageContent?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
  {#if $page?.data?.pageContent?.['Type'] == 'Component'} 
    <!-- temp hack -->
    <title>{$page?.data?.head.title}</title>
  {/if}
</svelte:head>

<div class="Path">
  {#key $page.data?.path || null }
    <Blogalog page={page} 
      components={{
        'custom': Custom,
        'teeth': Teeth,
      }} />
  {/key}
</div>



<script>

  import { marked } from 'marked'
  import { plainRenderer } from '$plasmid/utils/marked';
  import { page } from '$app/stores'
  
  import Blogalog from '$lib/components/Blogalog.svelte';

  import Custom from '$lib/components/Custom.svelte';
  import Teeth from '$lib/components/Teeth.svelte'; // decatur smiles
</script>

 

<style lang="scss" global>

  // :root {
  //   // set notion page width to default blogalog page width
  //   --notion-page-width: var(--blogalog-page-width);
  // }
</style>