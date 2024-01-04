

<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import { getNotionImageLink } from '$lib/helpers.js'
  import YAML from 'yaml'

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


  export let page;
  export let loginForm=null, unlockMessage=null;
  export let componentClasses = 'bg-slate-50'
  export let componentContainerClasses = ''

  let settings = {};
  if(page?.YAML) {
    settings = YAML.parse(page?.YAML)

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
  {#if page.Type.includes("Private") && !$userData['Email']}
    <!-- do nothing -->
  {:else if page.Type.includes("Public") && $userData['Email']}
    <!-- do nothing -->
  {:else}
    {#if page.Name == "Unlock" || page.Type.includes("Unlock") || page.Name == "Login" || page.Type.includes("Login")}
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
          <Notion blocks={page.pageBlocks} />
          <Login cta="Log in" message={unlockMessage}
            bind:formData={loginForm}
            onError={({ result }) => {
              unlockMessage = result.error.message;
            }}
            onUpdated={({ form, user }) => {
              if (form.valid) {
                if(form.data.email) {
                  // $userData['Email'] = form.data.email;
                  $userData = loginForm.user;
                  unlockMessage = "Success!";
                }
              } else {
                unlockMessage = "Email doesn‘t exist";
              }
            }}
            onSubmit={({ action, formData, formElement, controller, submitter, cancel }) => {
              formData.set('notion', page.Content); // use page.Content as the notionId
              unlockMessage = "Logging in...";
            }} 
          />
        {/if}
      </div>
    {:else if page.Name == "Email" || page.Type.includes("Email")}
      <div class="Component-Email | {componentClasses || ''} ">
          {#if (!page.Type?.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !== "Grid" && page.Name !=='undefined'}
            <h2 class="pt-0 mt-0">{page.Name}</h2>
          {/if}
          {#if page.Content}
            <div class="Component-Email-Content | {settings?.component?.content?.class} ">
              {@html md.render(page.Content||'')}
            </div>
          {/if}
          {#if page.pageBlocks }
            <div class="Component-Email-Blocks | {settings?.component?.blocks?.class} ">
              <Notion blocks={page.pageBlocks} />
            </div>
          {/if}
          <DataEntry cta="Sign Up"/>
      </div>

    {:else if page.Name == "Members" || page.Type.includes("Members")}
      <div class="Component-Members | {componentClasses || ''} ">
      </div>

    {:else if page.Name == "Grid" || page.Type.includes("Grid")}
      <div class="Component-Grid | {componentClasses||''} ">
        <div class="Component-Grid-Container {componentContainerClasses||''}">
          {#if (!page.Type?.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !== "Grid" && page.Name !=='undefined'}
            <h2 class="pt-0 mt-0">{page.Name}</h2>
          {/if}
          {#if page.pageBlocks }
            <div class="Component-Grid-Blocks | {settings?.component?.blocks?.class} ">
              <Notion blocks={page.pageBlocks} />
            </div>
          {/if}
        </div>
        <div class="Component-Grid-Items | {settings?.component?.items?.container?.class || 'mt-2'}">
          <GridItems {page} id={page.Content} {settings} />
        </div>
      </div>


    {:else if page.Name == "Expander" || page.Type.includes("Expander")}
      <div class="Component-Expander | {componentClasses || ''} ">
        <!-- {#if (!page.Type?.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !== "Grid" && page.Name !=='undefined'}
          <h2 class="pt-0 mt-0">{page.Name}</h2>
        {/if} -->
        <Expander {page} {settings} />
      </div>

    {:else if page.Name == "CTA" || page.Type.includes("CTA")}
      <div class="Component-CTA | {componentClasses || ''} ">
        <Cta {page} {settings} />
      </div>

    {:else if page.Name == "HTML" || page.Type.includes("HTML")}
      <div class="Component-HTML |{componentClasses || ''} ">
        {@html page.Content}
      </div>

    {:else if page.Name == "Markdown" || page.Type.includes("Markdown")}
      <div class="Component-Markdown | {componentClasses || ''} ">
        <Markdown {page} {settings} />
      </div>
    
    {:else if page.Name == "Links" || page.Type.includes("Links")}
      <div class="Component-Links | {componentClasses || ''} " use:addClasses>
        {#if page.pageBlocks}
          <div class="Component-Links-Content">
            {@html md.render(page.Content||'')}
          </div>
        {/if}
        <div class="Component-Links-Blocks | notion-links">
          {#if page.pageBlocks}
            <Notion blocks={page.pageBlocks} />
          {/if}
        </div>
      </div>

    {:else if page.Type.includes("Twitter")}
      <div class="Component-Twitter | {componentClasses || ''} ">
        <Twitter name={page.Name} />
      </div>

    {:else if page.Name == "Banner" || page.Type.includes("Banner")}
      <div class="Component-Banner | {componentClasses || ''} ">
        <Notion blocks={page.pageBlocks} />
        <a href={page.Content}>
          <img src="{getNotionImageLink(page)}" alt="{page.Name}" />
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