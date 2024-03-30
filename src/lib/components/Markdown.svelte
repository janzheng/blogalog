<main  class="Component-Markdown-main | {settings?.component?.content?.class || 'flex flex-col self-center'} {settings?.component?.reverse&&'order-2'} ">
  <div class="Component-Markdown-Content">
    {@html md.render(page.Content||'')}
  </div>
</main>
<aside bind:this={asideContainer} class="Component-Markdown-aside | {settings?.component?.reverse&&'order-1'} ">
  {#if page.pageBlocks}
    <div class="Component-Markdown-Blocks {settings?.component?.blocks?.class||'notion-soft'}" use:applyCustomStyles={settings?.styles}>
      <Notion blocks={page.pageBlocks} />
    </div>
  {/if}
</aside>



<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  import { applyCustomStyles } from '$lib/helpers.js'

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';

  import { browser } from '$app/environment';
  
  const md = new MarkdownIt({ breaks: true, html: true });
  md.use(markdownItAttrs);

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const level = token.tag;
    const className = settings?.component?.[`${level}`] || '';
    token.attrJoin('class', className);
    console.log('Heading open rule triggered::', token, level, className, settings?.component);
    return self.renderToken(tokens, idx, options);
  };

  export let page, isOpen=false, settings;
  let asideContainer;

  if(page) {
    page.Content = page?.Content?.replace(/\\n/g, '\n');
  }

  if(asideContainer && settings?.component?.expand) {
    console.log('>>> markdown container::', asideContainer)
    let expandSetting = settings?.component?.expand;
    const detailsElements = asideContainer.querySelectorAll('details');
    console.log('expandSetting --->> ',asideContainer, detailsElements, expandSetting)
    if(expandSetting == 'first') {
      detailsElements?.[0]?.setAttribute('open', '');
    } else if (expandSetting = 'all') {
      detailsElements.forEach(detail => {
        detail.setAttribute('open', '');
      });
    }
  }

</script>





<style lang="scss">
  
</style>