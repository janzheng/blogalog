
<div class="Cta-wrapper {settings?.component?.wrapper?.class || 'md:grid md:grid-cols-2 gap-2 md:gap-8 lg:gap-12'}">
  <main class="Cta-main | {settings?.component?.main?.class||'flex flex-col self-center'} | {settings?.component?.reverse&&'order-2'}">
    {#if page.Content}
      <div 
        class="Component-Cta-Content {settings?.component?.content?.class||''}"
        style="{ settings?.component?.content?.style || ''}"
        >
        {@html marked(page.Content||'')}
      </div>
    {/if}

    {#if settings?.cta || settings?.component?.cta || settings?.component?.alt}
      <div class="Component-Cta-Buttons {settings?.component?.buttons?.class||' '}">
        {#if (settings?.cta || settings?.component?.cta) && settings?.component?.cta?.href}
        <!-- removed pb-0 from the following as it made buttons look off (on CTAs, e.g. bunny cta) -->
          <a target="_blank" href={settings?.component?.cta?.href} class="Component-Cta | {settings?.component?.cta?.class||'Btn-solid cursor-pointer'}">
            {settings?.cta || settings?.component?.cta?.text}
          </a>
        {/if}
        {#if (settings?.alt || settings?.component?.alt) && settings?.component?.alt?.href}
        <!-- removed pb-0 from the following as it made buttons look off (on CTAs, e.g. bunny cta) -->
          <a target="_blank" href={settings?.component?.alt?.href} class="Component-Cta-alt | {settings?.component?.alt?.class||'Btn-textbg cursor-pointer'}">
            {settings?.alt || settings?.component?.alt?.text}
          </a>
        {/if}
      </div>
    {/if}
    
  </main>
  {#if page.pageBlocks}
    <aside class="Cta-aside {settings?.component?.aside?.class||''} {settings?.component?.reverse&&'order-1'}">
      <div class="Component-Cta-Blocks {settings?.component?.blocks?.class||'notion-soft'}">
        <Notion blocks={page.pageBlocks} />
      </div>
    </aside>
  {/if}

</div>




<script>
  import Notion from '@yawnxyz/sveltekit-notion';

  // import MarkdownIt from 'markdown-it';
  // import markdownItAttrs from 'markdown-it-attrs';
  // const md = new MarkdownIt({ breaks: true, html: true });
  // md.use(markdownItAttrs);

  import { marked } from 'marked';
  marked.use({
    breaks: true,
  });

  export let page, settings
  page.Content = page?.Content?.replace(/\\n/g, '\n');

  settings.component = {
    ...settings.component,
    // "h5": "leading-snug text-lg uppercase tracking-widest mb-2 text-slate-500",
    // "h1": "font-title text-green-900 leading-wide lg:leading-tight text-6xl mb-1 font-extrabold tracking-normal",
    // "h4": "text-2xl mb-2 font-sans tracking-wide",
  }

  const customRenderer = new marked.Renderer();
  customRenderer.heading = (text, level) => {
    const className = settings?.component?.[`h${level}`] || '';
    return `<h${level} class="${className}">${text}</h${level}>`;
  };

  marked.use({ renderer: customRenderer });
</script>





<style lang="scss">
  
</style>