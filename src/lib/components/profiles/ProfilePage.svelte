
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
    <div class="Profile-Header | {profileClass?.['header']} " class:hidden={blogData?.settings?.profile?.showHeader == false}>
      {#if coverImage}
        <div class="Profile-CoverImage-Container | {profileClass?.['coverContainer']}">
          <img class="Profile-CoverImage {profileClass?.['coverImage']}" src="{coverImage}" alt="Cover" />
        </div> 
      {/if}
      
      <!-- profile -->
      {#if profileImage}
      <div class="Profile-Header-ProfileImage-Container | {profileClass?.['profileImageContainer']}  | md:min-h-[10rem] sm:min-h-[7rem] ">
        <div class="Profile-Header-ProfileImage-Box | {profileClass?.['profileImageBox']} z-20 |">
          <img class="Profile-Header-ProfileImage | {profileClass?.['profileImage']} | absolute {coverImage ? ' -top-12' : ''}" src="{profileImage}" alt="Profile" />
          <div class="Profile-Header-ShortDesc | pt-20 sm:pt-0 sm:inline-block sm:relative sm:py-2 sm:ml-36">
            {#if author}<div class="Profile-Header-Author title | {profileClass?.['author']} ">{author || ''}</div>{/if}
            {#if socialLinks}
              <div class="Profile-Header-SocialBox-Container | text-2xl mb-4">
                <SocialBox {email} socialText={socialLinks} />
              </div>
            {/if}
            {#if shortDesc}<div class="Profile-Header-ShortDesc | text">{@html marked(shortDesc || '') }</div>{/if}
            {#if location}<div class="Profile-Header-Location | text pfix">{@html marked(location || '') }</div>{/if}
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
    </div>
    

    <!-- {#each sitePages as page} -->
    {#each pageOrder as row}
      {@const settings = row?.YAML && parseYaml(row?.YAML, row) || null}
      <!-- {@const settings = row?.YAML && parseYaml(row?.YAML) || null} -->
      {@const rowPageStyles = (settings?.page && generatePageStyles(settings.page, {type: 'string'})) || ''}
      {#if row.Name && row.Hide == true}
        <!-- do nothing if hidden -->
      {:else}
        <div class="Profile-Row-Wrapper" style={rowPageStyles + '; ' + settings?.row?.wrapper?.style||''}>
          <!-- special rows outside of standard row; for formatting usually -->
          {#if row?.Type?.includes('Header')}
            <div class="Profile-Row-Container | {settings?.row?.container?.class || 'mt-2 mb-0 content-notion-wide'} | overflow-hidden | " style={settings?.row?.container?.style||''}>
              <div class="Profile-Row--Header | {settings?.row?.class || ''} ">
                <div class="Profile-Row-Header-Title title {settings?.row?.headerClass || ' font-sans leading-tight text-lg mb-2 font-bold pt-0 mt-0'}">{row.Name}</div>
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
                      <div class="Profile-Row--Header title {settings?.row?.header?.class || ' font-sans leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{row.Name}</div>
                    {/if}
                    {#if row.Content}
                      {@html md.render(row.Content || '')}
                    {/if}
                    {#if row.pageBlocks && row.pageBlocks.length > 0}
                      <div class="Profile-Row--Blocks {settings?.row?.blocks?.class || 'notion-collapse'}">
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
                  <RenderComponent {row} />
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
  // import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import { marked } from 'marked';
  
  import { parseYaml, getNotionImageLink, generatePageStyles } from '$lib/helpers.js'
  import { userData } from '$lib/stores.js'
  // import { plainRenderer } from '$plasmid/utils/marked';
  
  import Notion from '@yawnxyz/sveltekit-notion';
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import RenderComponent from '$lib/components/RenderComponent.svelte';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'
  // import Login from '$lib/components/forms/Login.svelte';
  // import MemberList from '$lib/components/MemberList.svelte';
  // import GridItems from '$lib/components/GridItems.svelte';
  // import Expander from '$lib/components/Expander.svelte';
  import { componentTypes } from '$lib/componentTypes.js';
  import Posts from '$lib/components/Posts.svelte';

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt();
  md.use(markdownItAttrs);

  marked.use({
    breaks: true,
  });

  let blogData = getContext('blogData');

  let blog = blogData?.blog;
  let profileImage = getNotionImageLink(blog?.['site-data']?.['ProfileImage']);
  let coverImage = getNotionImageLink(blog?.['site-data']?.['CoverImage']);
  let author = blog?.['site-data']?.Author?.['Content'];
  let shortDesc = blog?.['site-data']?.ShortDescription?.['Content'];
  let longDesc = blog?.['site-data']?.LongDescription?.['Content'];
  let location = blog?.['site-data']?.Location?.['Content'];
  let socialDescription = blog?.['site-data']?.SocialDescription?.['Content'];
  let mainPageBlocks = blog?.['site-pages']?.find(page => page?.Type?.includes("Main"))?.pageBlocks;
  let email = blog?.['site-data']?.Email?.['Content'];
  let socialLinks = blog?.['site-data']?.SocialLinks?.['Content'];
  let sitePages = blog?.['site-pages'];
  // let blogpath = blogData?.pathSegments ? `/${blogData?.path}/` : "/";
  // let blogPath = blogData?.blogPath + '/';

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
  let pageOrder = [], sections = [];
  function buildPageOrer() {
    // build the sections list
    sitePages?.forEach(page => {
      if (page?.Type) {
        const Section = page.Section;
        if(Section && Section.length > 0 && Section !== ' ') {
          // console.log('Section -->', `[${Section}]`)
          const sectionExists = sections.find(section => section.Section === Section);
          if (sectionExists) {
            sectionExists.pages.push(page);
          } else {
            const newSection = { Section: Section, SectionDescription: page.SectionDescription, pages: [page] };
            sections.push(newSection);
          }
        }
      }
    });
    // build the pageOrder list
    sitePages?.forEach(page => {
      pageOrder.push(page);
      if (page.Section && !pageOrder.find(pageOrderPage => pageOrderPage.Group === page.Section)) {
        const section = sections.find(section => section.Section === page.Section);
        if (section) {
          const newObject = { Name: section.Section, Group: section.Section, Type: ['Group'], Pages: section.pages, SectionDescription: section.SectionDescription };
          pageOrder.push(newObject);
        }
      }
    });
    pageOrder = pageOrder.filter(item => (!item.Section || item.Section == ' '));
    // console.log('pageOrder:', pageOrder, sections);
  } buildPageOrer();

  

  // set profile styles
  
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

    // console.log('>>> profileClass:', profileClass)
  }

  // profileClass['header'] = "content-notion-wide mt-0 mb-2 rounded-sm overflow-hidden"
  // profileClass['coverImage'] = "w-full object-center object-contain scale-25"
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

</style>