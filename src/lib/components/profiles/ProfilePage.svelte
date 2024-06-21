
<svelte:head>
  {#if blogData?.head}
    <title>{blogData?.head?.title || 'Page not found!'}</title>
  {/if}
</svelte:head>


{#if !blog}
  <div class="Profile-NotFound | content-notion-wide | mt-24 rounded-sm overflow-hidden text-center">
    <h1>Page not found!</h1>
  </div>
{:else}

  <div class="Profile">
    <!-- mt-2 and mt-4 adds too much white space, unless full screen? option to add top margin? -->

    {#if blogData?.menu && blogData?.menu.profile !== true && blogData?.menu.global !== true}
      <Menu />
    {/if}
    


    <div class="Profile-Header | {profileClass?.['header']} " class:hidden={blogData?.settings?.profile?.showHeader == false}>
      {#if coverImage}
        <div class="Profile-CoverImage-Container | {profileClass?.['coverContainer']}">
          <img class="Profile-CoverImage {profileClass?.['coverImage']}" src="{coverImage}" alt="Cover" />
        </div> 
      {/if}
      
      {#if blogData?.settings?.profile?.showProfile !== false}
        <!-- profile -->
        {#if profileImage}
          <div class="Profile-Header-ProfileImage-Container | {profileClass?.['profileImageContainer']}  | md:min-h-[10rem] sm:min-h-[7rem] ">
            <div class="Profile-Header-ProfileImage-Box | {profileClass?.['profileImageBox']} z-20 |">
              <img class="Profile-Header-ProfileImage | {profileClass?.['profileImage']} |  {coverImage ? profileClass?.['profileCoverImage'] : ''}" src="{profileImage}" alt="Profile" />
              <div class="Profile-Header-ShortDesc | {profileClass?.['profileShortDesc']}">

                {#if profileClass?.['isAvailable']}
                  <div class="{profileClass?.isAvailable?.wrapper?.class || 'pl-[2px] flex items-center'}">
                    <div class="{profileClass?.isAvailable?.class || 'w-3 h-3 bg-green-500 rounded-full mr-2 animate-fast-pulse'}"></div>
                    <span>{profileClass?.isAvailable?.text || 'Available for work'}</span>
                  </div>
                {/if}
                
                {#if author}<div class="Profile-Header-Author font-title | {profileClass?.['author']} ">{author || ''}</div>{/if}
                {#if socialLinks}
                  <div class="Profile-Header-SocialBox-Container | {profileClass?.['profileSocials']} ">
                    <SocialBox {email} socialText={socialLinks} />
                  </div>
                {/if}
                {#if shortDesc}<div class="Profile-Header-ShortDescPara | text | {profileClass?.['profileShortDescPara']} ">{@html marked(shortDesc || '') }</div>{/if}
                {#if location}<div class="Profile-Header-Location | text pfix | {profileClass?.['profileShortDescLoc']}">{@html marked(location || '') }</div>{/if}
                <!-- <div class="text">{siteDesc?.substring(0, 50) || ''}{#if siteDesc?.length > 50}...{/if}</div> -->
              </div>
            </div>
          </div>
        {/if}
      
        {#if longDesc}
          <div class="Profile-Header-LongDesc | {profileClass?.['longDesc']}">
            {@html marked(longDesc || '')}
          </div>
        {/if}
      {/if}
    </div>

    <!-- <div class="bg-red-300 sticky top-0 relative z-50">
      Float-y below profile thing
    </div> -->
    

    <!-- this menu floats below the header / cover, but above all the components -->
    {#if blogData?.menu && blogData?.menu.profile == true && blogData?.menu.global !== true}
      <Menu wrapperClasses="sticky top-0 relative z-50" />
    {/if}
    



    <!-- {#each sitePages as page} -->
    {#each pageOrder as row, rowIndex }
      {@const settings = row?.YAML && parseYaml(row?.YAML, row) || null}
      <!-- {@const settings = row?.YAML && parseYaml(row?.YAML) || null} -->
      {@const rowPageStyles = (settings?.page && generatePageStyles(settings.page, {type: 'string'})) || ''}
      {#if row.Name && row.Hide == true}
        <!-- do nothing if hidden -->
      {:else}
        <span id={settings?.id || 'row-'+rowIndex} class="row-anchor {blogData.settings?.anchor?.class}"></span>
        <div class="Profile-Row-Wrapper" style={rowPageStyles + '; ' + settings?.row?.wrapper?.style||''}>
          <!-- special rows outside of standard row; for formatting usually -->
          {#if row?.Type?.includes('Header')}
            <div id={'row-'+rowIndex} class="Profile-Row-Container | {settings?.row?.container?.class || 'mt-2 mb-0 content-notion-wide'} | overflow-hidden | " style={settings?.row?.container?.style||''}>
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
                      <div class="Profile-Row--Content {settings?.row?.content?.class || ''}">
                        {@html md.render(row.Content || '')}
                      </div>
                    {/if}
                    {#if row.pageBlocks && row.pageBlocks.length > 0}
                      <div class="Profile-Row--Blocks {settings?.row?.blocks?.class || 'notion-collapse'}" use:applyCustomStyles={settings?.styles}>
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
                      <Posts posts={row.Pages.filter(page => page?.Type?.includes("Posts") && !page.Hide)}></Posts>
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
              <!-- {:else if page?.Type?.includes('Component') && page.Hide !== true} -->
              {:else if row?.Type?.some(type => componentTypes.includes(type)) && !row?.Hide }
                <div class="Profile-Row--Component-Container | {settings?.row?.class || profileClass?.defaultRow}">
                  <RenderComponent {row} {components} />
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
    
  </div>
{/if}










<script>
  // import YAML from 'yaml'
  // import { browser, dev } from '$app/environment';
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import { marked } from 'marked';
  // import { scrollToAnchor } from '$plasmid/utils/scrollto'
  
  import Blogalog from '$lib/components/Blogalog.svelte';
  import { parseYaml, getNotionImageLink, generatePageStyles, applyCustomStyles } from '$lib/helpers.js'
  import { userData } from '$lib/stores.js'
  // import { plainRenderer } from '$plasmid/utils/marked';
  
  import Notion from '@yawnxyz/sveltekit-notion';
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import Menu from '$lib/components/Menu.svelte';
  import RenderComponent from '$lib/components/RenderComponent.svelte';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'
  // import Login from '$lib/components/forms/Login.svelte';
  // import GridItems from '$lib/components/GridItems.svelte';
  // import Expander from '$lib/components/Expander.svelte';
  import { componentTypes } from '$lib/componentTypes.js';
  import Posts from '$lib/components/Posts.svelte';

  import { buildPageOrder } from './'

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt({ breaks: true, html: true });
  md.use(markdownItAttrs);

  marked.use({
    breaks: true,
  });

  export let components;
  export let blogData = getContext('blogData');

  let blog = blogData?.blog;
  let profileImage = getNotionImageLink(blog?.['site-data']?.['ProfileImage']);
  let coverImage = getNotionImageLink(blog?.['site-data']?.['CoverImage']);
  let author = blog?.['site-data']?.Author?.['Content'];
  let shortDesc = blog?.['site-data']?.ShortDescription?.['Content'];
  let longDesc = blog?.['site-data']?.LongDescription?.['Content'];
  let location = blog?.['site-data']?.Location?.['Content'];
  let email = blog?.['site-data']?.Email?.['Content'];
  let socialLinks = blog?.['site-data']?.SocialLinks?.['Content'];
  let sitePages = blog?.['site-pages'];

  let sitePageByType = {}, sitePageTypes = [];
  blog?.['site-pages']?.forEach(page => {
    sitePageTypes = [...sitePageTypes, ...page?.Type];
    if(!sitePageByType[page?.Type]) {
      sitePageByType[page?.Type] = [];
    }
    sitePageByType[page?.Type].push(page);
  });
  sitePageTypes = [...new Set(sitePageTypes)]; 

  // build a Page Order where different sections are grouped together and placed where the first instance of that section appears
  let pageOrder = buildPageOrder({sitePages});

  

  // set profile styles
  
  let profileClass = blogData?.settings?.profile || {}
  if(profileClass) {
    profileClass.header = profileClass.headerClass                          || 'content-notion-wide | mt-0 md:mt-2 lg:mt-4 mb-2 rounded-sm overflow-hidden';
    profileClass.coverContainer = profileClass.coverContainer               || 'min-h-[4rem] overflow-hidden';
    profileClass.coverImage = profileClass.coverImage                       || 'w-full object-left-top object-contain';
    profileClass.profileImageContainer = profileClass.profileImageContainer || 'relative bg-slate-50';
    profileClass.profileImageBox = profileClass.profileImageBox             || 'px-4 pt-4 | relative md:relative';
    profileClass.profileImage = profileClass.profileImage                   || 'w-32 h-32 bg-white object-cover rounded-full border-solid border-4 border-white overflow-hidden';
    profileClass.profileCoverImage = profileClass.profileCoverImage         || 'absolute -top-12';
    profileClass.profileShortDesc = profileClass.profileShortDesc           || 'pt-20 sm:pt-0 sm:inline-block sm:relative sm:py-2 sm:ml-36';
    profileClass.profileShortDescPara = profileClass.profileShortDescPara   || ' ';
    profileClass.profileShortDescLoc = profileClass.profileShortDescLoc     || ' ';
    profileClass.author = profileClass.author                               || 'text-2xl sm:text-4xl font-bold py-2';
    profileClass.longDesc = profileClass.longDesc                           || 'p-4 bg-slate-50 content-notion-wide';
    profileClass.profileSocials = profileClass.profileSocials                     || 'text-2xl mb-4';
    
    profileClass.defaultRowContainer = profileClass.defaultRowContainer     || 'mb-2 content-notion-wide';
    profileClass.defaultRow = profileClass.defaultRow                       || 'p-4 bg-slate-50 | ';
  }
  
</script>






<style lang="scss" global>

  .content-pad {
    @apply px-8 md:px-32 py-8 mx-auto;
    // max-width: var(--notion-page-width);
  }

  .content-custom-width {
    max-width: var(--blogalog-page-custom-width);
    margin-left: auto;
    margin-right: auto;
  }
  
  .content-notion-wide {
    max-width: var(--blogalog-page-width, 704px);
    margin-left: auto;
    margin-right: auto;
  }

  .content-notion-wider {
    max-width: calc(var(--notion-page-width) + 224px);
    margin-left: auto;
    margin-right: auto;
  }
  .notion-callout-icon {
    align-self: flex-start;
  }
  .notion-page-icon {
    font-size: 1.7rem;;
  }

  .Profile {
    background-color: var(--color-bg);
  }

  .Profile-Row-Main {
    h2, h3, h4 {
      &:first-of-type {
        @apply pt-1; // tiny padding for first header keeps it tighter
      }
    }
  }




  @keyframes fast-pulse {
    0% {
      transform: scale(1);
      opacity: 1;
      background-color: #4caf50;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.5;
      background-color: #81c784;
    }
    100% {
      transform: scale(1);
      opacity: 1;
      background-color: #4caf50;
    }
  }

  .animate-fast-pulse {
    animation: fast-pulse 1.4s infinite;
  }

</style>