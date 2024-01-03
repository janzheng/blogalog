
<div class="Cta-wrapper hellohello {settings?.component?.wrapper?.class || 'md:grid md:grid-cols-2 gap-2 md:gap-4 lg:gap-8'}">
  <main class="Cta-main | {settings?.component?.main?.class||'flex flex-col self-center'} | {settings?.component?.reverse&&'order-2'}">
    <!-- only use Content for titles; otherwise gets super confusing -->
    <!-- <div class="Cta-Markdown-Name {settings?.component?.title?.class || ' headline leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{page.Name}</div> -->
    
    {#if page.Content}
      <div class="Component-Cta-Content {settings?.component?.content?.class||''}">
        {@html md.render(page.Content||'')}
      </div>
    {/if}

    {#if settings?.cta}
      <div class="Component-Cta-Buttons {settings?.component?.buttons?.class||' '}">
        {#if settings?.cta && settings?.component?.cta?.href}
          <a target="_blank" href={settings?.component?.cta?.href} class="Component-Cta | {settings?.component?.cta?.class||'Btn-solid cursor-pointer pb-0'}">
            {settings?.cta}
          </a>
        {/if}
        {#if settings?.alt && settings?.component?.alt?.href}
          <a target="_blank" href={settings?.component?.alt?.href} class="Component-Cta-alt | {settings?.component?.alt?.class||'Btn-textbg cursor-pointer pb-0'}">
            {settings?.alt}
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
  const md = new MarkdownIt();
  md.use(markdownItAttrs);

  // import { marked } from 'marked';
  // marked.use({
  //   breaks: true,
  // });

  export let page, isOpen=false, settings
  page.Content = page?.Content?.replace(/\\n/g, '\n');
  
</script>





<style lang="scss">
  
</style>