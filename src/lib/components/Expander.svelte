
<div class="Expander">
  {#if settings?.cta}
    {@html marked(page.Content)}
    <button class="Btn-solid | Component-Expander-cta cursor-pointer pb-0 | {isOpen && "--open"} pfix " on:click={()=>isOpen=!isOpen}>{settings?.cta}</button>
    <div class:isOpen class="Component-Expander-body pt-4 | {!isOpen && "hidden"}">
      <Notion blocks={page.pageBlocks} />
    </div>
  {:else}
    <details>
      <summary class="Component-Expander-summary cursor-pointer pb-0">{page.Content}</summary>
      <div class="Component-Expander-body pl-4 pt-2">
        <Notion blocks={page.pageBlocks} />
      </div>
    </details>
  {/if}
</div>




<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  import YAML from 'yaml';

  import { marked } from 'marked';
  marked.use({
    breaks: true,
  });
  
  export let page, isOpen=false
  page.Content = page.Content.replace(/\\n/g, '\n');

  let settings
  if(page.YAML)
    settings = YAML.parse(page.YAML)
</script>





<style lang="scss">
  
</style>