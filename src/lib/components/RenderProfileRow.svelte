
<script>
  import { getContext } from 'svelte';
  import Notion from '@yawnxyz/sveltekit-notion';

  import { componentTypes } from '$lib/componentTypes.js';
  import { userData } from '$lib/stores.js'
  import { parseYaml, getNotionImageLink, generatePageStyles, applyCustomStyles } from '$lib/helpers.js'

  import RenderComponent from '$lib/components/RenderComponent.svelte';
  import Posts from '$lib/components/Posts.svelte';


  import { marked } from 'marked'
  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt({ breaks: true, html: true });
  md.use(markdownItAttrs);

  marked.use({
    breaks: true,
  });

  export let showHidden = true; // used to show rows explicitly w/ .Hide -> for PageGroups and debugging
  export let row;
  export let blogData = getContext('blogData');
  export let settings = row?.YAML && parseYaml(row?.YAML, row)
  export let rowIndex;
  export let rowPageStyles = (settings?.page && generatePageStyles(settings.page, {type: 'string'})) || '';
  
  let profileClass = blogData?.settings?.profile || {}
  if(profileClass) {
    profileClass.header = profileClass.headerClass                          || 'content-notion-wide | mt-0 md:mt-2 lg:mt-4 mb-2 rounded-sm overflow-hidden';
    profileClass.coverContainer = profileClass.coverContainer               || 'min-h-[4rem] overflow-hidden';
    profileClass.coverImage = profileClass.coverImage                       || 'w-full object-left-top object-contain';
    profileClass.profileImageContainer = profileClass.profileImageContainer || 'relative bg-slate-50';
    profileClass.profileImageBox = profileClass.profileImageBox             || 'px-4 pt-4 | relative md:relative';
    profileClass.profileImage = profileClass.profileImage                   || 'w-32 h-32 bg-white object-cover rounded-full border-solid border-4 border-white overflow-hidden';
    profileClass.author = profileClass.author                               || 'text-2xl sm:text-4xl font-bold py-2';
    profileClass.longDesc = profileClass.longDesc                           || 'p-4 bg-slate-50 content-notion-wide';
    
    profileClass.defaultRowContainer = profileClass.defaultRowContainer     || 'mb-2 content-notion-wide';
    profileClass.defaultRow = profileClass.defaultRow                       || 'p-4 bg-slate-50 | ';

    profileClass.h1 = profileClass.h1 || 'text-red-500 text-4xl font-bold mb-4';
    profileClass.h2 = profileClass.h2 || 'text-red-500 text-3xl font-bold mb-3';
    profileClass.h3 = profileClass.h3 || 'text-red-500 text-2xl font-bold mb-2';
    profileClass.h4 = profileClass.h4 || 'text-red-500 text-2xl font-bold mb-2';
    profileClass.h5 = profileClass.h5 || 'text-red-500 text-2xl font-bold mb-2';
    profileClass.h6 = profileClass.h6 || 'text-red-500 text-2xl font-bold mb-2';
  
    // console.log('>>> profileClass:', profileClass)
  }



  
</script>

<div id={'row-'+rowIndex||0} class="Profile-Row-Wrapper | {settings?.row?.wrapper?.class || ''}" style={rowPageStyles||'' + '; ' + settings?.row?.wrapper?.style||''}>
  <!-- special rows outside of standard row; for formatting usually -->
  {#if row?.Type?.includes('Header')}
    <div id={'row-'+rowIndex} class="Profile-Row-Container --header | {settings?.row?.container?.class || 'mt-2 mb-0 content-notion-wide'} | overflow-hidden | " style={settings?.row?.container?.style||''}>
      <div class="Profile-Row--Header | {settings?.row?.class || ''} ">
        <div class="Profile-Row-Header-Title font-title {settings?.row?.headerClass || ' font-sans leading-tight text-lg mb-2 font-bold pt-0 mt-0'}">{row.Name}</div>
      </div>
    </div>
  {:else}
    <div class="Profile-Row-Container | {settings?.row?.container?.class || profileClass?.defaultRowContainer}  | " style={settings?.row?.container?.style||''}>
      <!-- {page.Name} -->
      {#if row?.Type?.includes('Main')}
        {#if row?.Type.includes("Private") && !$userData['Email']}
          <!-- alternatively show an error message for Private pages when user isn't logged in -->
          <!-- <div class="text-red-500">This page is private. Please log in to view.</div> -->
        {:else if row?.Type.includes("Public") && $userData['Email']}
          <!-- hide public pages when user is logged in -->
        {:else}
          <div class="Profile-Row | {settings?.row?.class || profileClass?.defaultRow} ">
            {#if (!row?.Type.includes("#noheader") && !row.Attributes?.includes("noheader")) && row.Name !=='undefined'}
              <!-- used to be h2 -->
              <div class="Profile-Row--Header font-title {settings?.row?.header?.class || ' font-sans leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{row.Name}</div>
            {/if}
            {#if row.Content}
              {@html md.render(row.Content || '')}
            {/if}
            {#if row.pageBlocks && row.pageBlocks.length > 0}
              <div class="Profile-Row--Blocks notion-container {settings?.row?.blocks?.class || 'notion-collapse'}" 
                style={settings?.row?.blocks?.style||''}
                use:applyCustomStyles={settings?.styles}>
                <Notion
                  blocks={row.pageBlocks} 
                  settings={{
                    video: {
                      // turning all of these on turns a video into a gif
                      autoplay: true,
                      muted: true, // true: necessary for autoplay
                      playsinline: true, // for mobile so it doesn't full-screen
                      loop: true,
                    }
                  }} 
                />
              </div>
            {/if}
          </div>
        {/if}

      {:else if row?.Type?.includes('Group')}
        {#if row?.Type.includes("Private") && !$userData['Email']}
          <!-- do nothing -->
        {:else if row?.Type.includes("Public") && $userData['Email']}
          <!-- do nothing -->
        {:else}
          <div class="Profile-Row--Group Profile-Row--Posts | {settings?.row?.class || profileClass?.defaultRow + ' | my-2 overflow-hidden'} ">
            <div class="Profile-Row--Group-Header | {settings?.group?.header?.class || 'h5 pt-0 mt-0'}">{row.Group}</div>
            {#if row.SectionDescription}<p class="{settings?.group?.description?.class || 'pb-8'} ">{row.SectionDescription}</p>{/if}
            <div class="Profile-Row--Group-Container Profile-Row--Posts-Container">
              <Posts posts={row.Pages.filter(page => page?.Type?.includes("Posts") && (!page.Hide || showHidden))}></Posts>
            </div>
          </div>
        {/if}
      {:else if row?.Type?.includes('Posts')}
        {#if row?.Type.includes("Private") && !$userData['Email']}
          <!-- do nothing -->
        {:else if row?.Type.includes("Public") && $userData['Email']}
          <!-- do nothing -->
        {:else}
          <!-- loose posts are NOT grouped together unless given a section -->
          <div class="Profile-Row--Posts-Container | {settings?.row?.class || profileClass?.defaultRow}">
            <Posts posts={[row]} ></Posts>
          </div>
        {/if}
      {:else if row?.Type?.some(type => componentTypes.includes(type)) && (!row?.Hide || showHidden) }
        <div class="Profile-Row--Component-Container | {settings?.row?.class || profileClass?.defaultRow}">
          <RenderComponent {row} />
        </div>
      {/if}
    </div>
  {/if}
</div>