
<div class="Expander">
  {#if settings?.cta}
    {#if page.Content}
      <div class="Component-Expander-Content | {settings?.component?.content?.class||''}">
        {@html md.render(page.Content)}
      </div>
    {/if}
    <div class="Expander-buttons">
      <!-- pb-0 messes up cta on ivom -->
      <!-- {settings?.component?.cta?.class||'Btn-solid cursor-pointer pb-0'} | {isOpen && "--open"} pfix "  -->
      <button class="Component-Expander-CTA | 
        {settings?.component?.cta?.class||'Btn-solid cursor-pointer'} | {isOpen && "--open"} pfix " 
        on:click={()=>isOpen=!isOpen}>
          {settings?.cta}
      </button>

      {#if settings?.alt && settings?.component?.alt?.href}
        <a target="_blank" href={settings?.component?.alt?.href} class="Component-Expander-alt | {settings?.component?.alt?.class||'Btn-outline cursor-pointer pb-0'}">
          {settings?.alt}
        </a>
      {/if}
    </div>
    {#if page.pageBlocks}
      <div class:isOpen class="Component-Expander-blocks notion-container pt-4 | {!isOpen && "hidden"}" 
        style={settings?.style||''}
        use:applyCustomStyles={settings?.styles}>
        <Notion blocks={page.pageBlocks} />
      </div>
    {/if}
  {:else}
    <details>
      <summary class="Component-Expander-summary cursor-pointer pb-0">{@html md.render(page.Content||'')}</summary>
      {#if page.pageBlocks}
        <div class="Component-Expander-blocks notion-container pl-4 pt-2"
          style={settings?.style||''} 
          use:applyCustomStyles={settings?.styles}>
          <Notion blocks={page.pageBlocks} />
        </div>
      {/if}
    </details>
  {/if}
</div>




<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  // import YAML from 'yaml';

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  import { applyCustomStyles } from '$lib/helpers.js'

  const md = new MarkdownIt({ breaks: true, html: true });
  md.use(markdownItAttrs);

  // import { marked } from 'marked';
  // marked.use({
  //   breaks: true,
  // });
  
  export let page, isOpen=false, settings
  page.Content = page?.Content?.replace(/\\n/g, '\n');

  // if(page.YAML) {
  //   settings = YAML.parse(page.YAML)
  // }
</script>





<style lang="scss">
  
</style>