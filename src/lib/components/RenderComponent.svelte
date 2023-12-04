

<script>
  // import Notion from '@yawnxyz/sveltekit-notion';
  import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import { getNotionImageLink } from '$lib/helpers.js'
  import YAML from 'yaml'

  import { userData } from '$lib/stores.js'

  import Email from '$lib/components/forms/Login.svelte';
  import GridItems from '$lib/components/GridItems.svelte';
  import Expander from '$lib/components/Expander.svelte';
  // import MemberList from '$lib/components/MemberList.svelte';
	// import SocialBox from '$plasmid/components/SocialBox2.svelte'

	import Twitter from '$plasmid/components/TwitterTimeline.svelte'


  export let page;
  export let emailForm, unlockMessage;
  export let componentClasses = 'p-4 bg-slate-50'

  let settings = {};
  if(page?.YAML) {
    settings = YAML.parse(page?.YAML)

    if(settings?.component) {
      componentClasses = settings?.component?.class;
    }
  }

  // import { marked } from 'marked';
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
        console.log(':::: link:', link, settings?.list?.class)
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








<div class="RenderComponent | {settings?.component?.container?.class} " style={settings?.component?.container?.style} >
  {#if page.Type.includes("Private") && !$userData['Email']}
    <!-- do nothing -->
  {:else if page.Type.includes("Public") && $userData['Email']}
    <!-- do nothing -->
  {:else}
    {#if page.Name == "Unlock" || page.Type.includes("Unlock") || page.Name == "Login" || page.Type.includes("Login")}
      <div class="Component-Login | {componentClasses} ">
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
          <Email cta="Log in" message={unlockMessage}
            bind:formData={emailForm}
            onError={({ result }) => {
              unlockMessage = result.error.message;
            }}
            onUpdated={({ form, user, banana }) => {
              if (form.valid) {
                if(form.data.email) {
                  // $userData['Email'] = form.data.email;
                  $userData = emailForm.user;
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
    {:else if page.Name == "Members" || page.Type.includes("Members")}
      <div class="Component-Members | {componentClasses} ">
        <!-- deprecated -->
        <!-- <Notion blocks={page.pageBlocks} /> -->
        <!-- <MemberList id={page.Content} settings={page.YAML} /> -->
      </div>
    {:else if page.Name == "Grid" || page.Type.includes("Grid")}
      <div class="Component-Grid | {componentClasses} ">
        {#if (!page.Type?.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !== "Grid" && page.Name !=='undefined'}
          <h2 class="pt-0 mt-0">{page.Name}</h2>
        {/if}
        <Notion blocks={page.pageBlocks} />
        <div class="Component-GridItems | mt-2">
          <GridItems id={page.Content} {settings} />
        </div>
      </div>
    {:else if page.Name == "Expander" || page.Type.includes("Expander")}
      <div class="Component-Expander | {componentClasses} ">
        {#if (!page.Type?.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !== "Grid" && page.Name !=='undefined'}
          <h2 class="pt-0 mt-0">{page.Name}</h2>
        {/if}
        <Expander {page} />
      </div>
    {:else if page.Name == "HTML" || page.Type.includes("HTML")}
      <div class="Component-HTML |{componentClasses} ">
        {@html page.Content}
      </div>
    {:else if page.Name == "Markdown" || page.Type.includes("Markdown")}
      <div class="Component-Markdown | {componentClasses} ">
        <div class="Profile-Title Component-Markdown-Name {settings?.row?.header?.class || ' font-sans leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{page.Name}</div>
        <div class="Component-Markdown-Content">
          {@html md.render(page.Content||'')}
        </div>
        <div class="Component-Markdown-Blocks">
          <Notion blocks={page.pageBlocks} />
        </div>
      </div>
    
    {:else if page.Name == "Links" || page.Type.includes("Links")}
      <div class="Component-Links | _link-reset {componentClasses} " use:addClasses>
        <!-- <div class="Profile-Title Component-Links-Name {settings?.row?.header?.class || ' font-sans leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{page.Name}</div> -->
        <Notion blocks={page.pageBlocks} />
      </div>

    {:else if page.Type.includes("Twitter")}
      Twitter Component
      <div class="Component-Twitter | {componentClasses} ">
        <!-- <div class="Profile-Title Component-Links-Name {settings?.row?.header?.class || ' font-sans leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{page.Name}</div> -->
        <Twitter />
      </div>

    {:else if page.Name == "Banner" || page.Type.includes("Banner")}
      <div class="Component-Banner | {componentClasses} ">
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