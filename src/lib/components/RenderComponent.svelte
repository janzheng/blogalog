

<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import { safeParse, getNotionImageLink } from '$lib/helpers.js'
  // import YAML from 'yaml'

  import { userData } from '$lib/stores.js'

  import Login from '$lib/components/forms/Login.svelte';
  import DataEntry from '$lib/components/forms/DataEntry.svelte';
  import GridItems from '$lib/components/GridItems.svelte';
  import Expander from '$lib/components/Expander.svelte';
  import Markdown from '$lib/components/Markdown.svelte';
  import Cta from '$lib/components/Cta.svelte';
  // import MemberList from '$lib/components/MemberList.svelte';
	// import SocialBox from '$plasmid/components/SocialBox2.svelte'

	import Twitter from '$plasmid/components/TwitterTimeline.svelte'


  export let row;
  // export let loginForm=null, unlockMessage=null;
  export let componentClasses = 'bg-slate-50'
  export let componentContainerClasses = ''

  let settings = {};
  if(row?.YAML) {
    settings = safeParse(row?.YAML)

    if(settings?.component) {
      componentClasses = settings?.component?.class;
      componentContainerClasses = settings?.component?.containerClass;
    }
  }

  // import { marked } from 'marked';c
  // marked.use({
  //   breaks: true,
  // });

  // use markdownit instead of marked, for attrs
  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt();
  md.use(markdownItAttrs);


  // dynamically add classes to Lists
  // todo: open this up to other components?
  export function addClasses(node) {
    const links = node.getElementsByTagName('a');
    if(settings?.list?.class) {
      for (let link of links) {
        const classes = settings?.list?.class?.split(' ').filter(Boolean); // filter out empty strings
        link?.classList?.add("link-custom", ...classes);
      }
    }
    return {
      destroy() {
        // cleanup if necessary
      }
    };
  }

</script>








<div class="RenderComponent | {settings?.component?.container?.class || ''} " style={settings?.component?.container?.style||''} >
  {#if row.Type.includes("Private") && !$userData['Email']}
    <!-- do nothing -->
  {:else if row.Type.includes("Public") && $userData['Email']}
    <!-- do nothing -->
  {:else}
    {#if row.Name == "Unlock" || row.Type.includes("Unlock") || row.Name == "Login" || row.Type.includes("Login")}
      <div class="Component-Login | {componentClasses || ''} ">
        {#if $userData['Email']}
          <div class="Component-Login-Status">
            Logged in as {$userData['Email']}. <button on:click={()=>{
              $userData['Email'] = null;
            }} class="Btn-link --short">Log out</button>
          </div>
          <div class="Component-Login-Details | mt-2">
            {#if $userData['Payments']}
              ✅ You are fully Paid!  
              <div class="text-sm" >Receipt: <span class="text-slate-400">{$userData['Payments']}</span></div>
            {/if}
          </div>
        {:else}
          {#if row.pageBlocks }
            <div class="Component-Login-Blocks | {settings?.component?.blocks?.class} ">
              <Notion blocks={row.pageBlocks} />
            </div>
          {/if}
          <Login cta="{settings?.component?.cta||'Log in'}" {row} />
        {/if}
      </div>
    {:else if row.Name == "DataEntry" || row.Type.includes("DataEntry")}
      <div class="Component-DataEntry | {componentClasses || ''} ">
        {#if (!row.Type?.includes("#noheader") && !row.Attributes?.includes("noheader")) && row.Name !== "Grid" && row.Name !=='undefined'}
          <h2 class="pt-0 mt-0">{row.Name}</h2>
        {/if}
        {#if row.pageBlocks }
          <div class="Component-DataEntry-Blocks | {settings?.component?.blocks?.class} ">
            <Notion blocks={row.pageBlocks} />
          </div>
        {/if}
        <DataEntry {row} cta="{settings?.component?.cta||'Submit'}"/>
      </div>

    {:else if row.Name == "Members" || row.Type.includes("Members")}
      <div class="Component-Members | {componentClasses || ''} ">
      </div>

    {:else if row.Name == "Grid" || row.Type.includes("Grid")}
      <div class="Component-Grid | {componentClasses||''} ">
        <div class="Component-Grid-Container {componentContainerClasses||''}">
          {#if (!row.Type?.includes("#noheader") && !row.Attributes?.includes("noheader")) && row.Name !== "Grid" && row.Name !=='undefined'}
            <h2 class="pt-0 mt-0">{row.Name}</h2>
          {/if}
          {#if row.pageBlocks }
            <div class="Component-Grid-Blocks | {settings?.component?.blocks?.class} ">
              <Notion blocks={row.pageBlocks} />
            </div>
          {/if}
        </div>
        <div class="Component-Grid-Items | {settings?.component?.items?.container?.class || 'mt-2'}">
          <GridItems {row} {settings} />
        </div>
      </div>


    {:else if row.Name == "Expander" || row.Type.includes("Expander")}
      <div class="Component-Expander | {componentClasses || ''} ">
        <!-- {#if (!page.Type?.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !== "Grid" && page.Name !=='undefined'}
          <h2 class="pt-0 mt-0">{page.Name}</h2>
        {/if} -->
        <Expander page={row} {settings} />
      </div>

    {:else if row.Name == "CTA" || row.Type.includes("CTA")}
      <div class="Component-CTA | {componentClasses || ''} ">
        <Cta page={row} {settings} />
      </div>

    {:else if row.Name == "HTML" || row.Type.includes("HTML")}
      <div class="Component-HTML |{componentClasses || ''} ">
        {@html row.Content}
      </div>

    {:else if row.Name == "Markdown" || row.Type.includes("Markdown")}
      <div class="Component-Markdown | {componentClasses || ''} ">
        <Markdown page={row} {settings} />
      </div>
    
    {:else if row.Name == "Links" || row.Type.includes("Links")}
      <div class="Component-Links | {componentClasses || ''} " use:addClasses>
        {#if row.pageBlocks}
          <div class="Component-Links-Content">
            {@html md.render(row.Content||'')}
          </div>
        {/if}
        <div class="Component-Links-Blocks | notion-links">
          {#if row.pageBlocks }
            <div class="Component-Links-Blocks | {settings?.component?.blocks?.class} ">
              <Notion blocks={row.pageBlocks} />
            </div>
          {/if}
        </div>
      </div>

    {:else if row.Type.includes("Twitter")}
      <div class="Component-Twitter | {componentClasses || ''} ">
        <Twitter name={row.Name} />
      </div>

    {:else if row.Name == "Banner" || row.Type.includes("Banner")}
      <div class="Component-Banner | {componentClasses || ''} ">
        {#if row.pageBlocks }
          <div class="Component-Banner-Blocks | {settings?.component?.blocks?.class} ">
            <Notion blocks={row.pageBlocks} />
          </div>
        {/if}
        <a href={row.Content}>
          <img src="{getNotionImageLink(row)}" alt="{row.Name}" />
        </a>
      </div>
    {/if}
  {/if}



</div>

<style lang="scss" global>


// .Component-Links {
//   a {
//     @apply border-2 border-slate-400 rounded-md p-2 block mb-2 no-underline hover:no-underline text-2xl font-serif;
//   }
// }
</style>