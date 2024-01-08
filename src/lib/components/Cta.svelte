
<div class="Cta-wrapper hellohello {settings?.component?.wrapper?.class || 'md:grid md:grid-cols-2 gap-2 md:gap-4 lg:gap-8'}">
  <main class="Cta-main | {settings?.component?.main?.class||'flex flex-col self-center'} | {settings?.component?.reverse&&'order-2'}">
    <!-- only use Content for titles; otherwise gets super confusing -->
    <!-- <div class="Cta-Markdown-Name {settings?.component?.title?.class || ' headline leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{page.Name}</div> -->
    
    {#if page.Content}
      <div class="Component-Cta-Content {settings?.component?.content?.class||''}">
        <!-- somehow md.render doesn't work here; maybe bc text idk lol (build club headline bug; maybe a break after <b>?) -->
        <!-- ??? {@html md.render(page.Content||'')} ??? -->
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

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  // const md = new MarkdownIt();
  // md.use(markdownItAttrs);

  import { marked } from 'marked';
  marked.use({
    breaks: true,
  });

  export let page, isOpen=false, settings
  page.Content = page?.Content?.replace(/\\n/g, '\n');
  
</script>





<style lang="scss">
  
</style>