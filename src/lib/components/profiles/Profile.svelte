
<svelte:head>
  {#if $page.data.head}
    <title>{$page.data.head?.title || 'Blog not found!'}</title>
  {/if}
</svelte:head>

{#if !blog}
  <div class="Profile-Header | content-notion-wide | mt-24 rounded-sm overflow-hidden text-center">
    <h1>Blog not found!</h1>
  </div>
{:else}
  <div class="Profile">
    <div class="Profile-Header | content-notion-wide | mt-0 md:mt-2 lg:mt-4 rounded-sm overflow-hidden  ">
      <!-- cover -->
      {#if coverImage}
        <div class="CoverImage | min-h-[4rem] overflow-hidden">
          <img class="w-full object-left-top object-contain" src="{coverImage}" alt="Cover" />
        </div> 
      {/if}
      
      <!-- profile -->
      {#if profileImage}
      <div class="ProfileImage-Container | relative bg-slate-50 | md:min-h-[10rem] sm:min-h-[7rem] ">
        <div class="ProfileImage | px-4 pt-4 | relative md:relative z-20 |">
          <img class="w-32 h-32 | bg-white object-cover rounded-full border-solid border-4 border-white overflow-hidden | absolute {coverImage ? ' -top-12' : ''}" src="{profileImage}" alt="Profile" />
          <div class="ProfileShortDesc | pt-20 sm:pt-0 sm:inline-block sm:relative sm:py-2 sm:ml-36">
          <!-- <div class="ProfileShortDesc | pt-20 sm:pt-0 sm:inline-block sm:relative sm:py-2 sm:ml-36 md:w-[36rem]"> -->
            {#if author}<div class="Author text-2xl sm:text-4xl font-bold py-2">{author || ''}</div>{/if}
            <!-- <div class="text">{siteDesc || ''}</div> -->
            {#if socialLinks}
              <div class="text-2xl | mb-4">
                <SocialBox {email} socialText={socialLinks} />
              </div>
            {/if}
            {#if shortDesc}<div class="ShortDesc text">{@html marked(shortDesc || '') }</div>{/if}
            {#if location}<div class="Location text pfix">{@html marked(location || '') }</div>{/if}
            <!-- <div class="text">{siteDesc?.substring(0, 50) || ''}{#if siteDesc?.length > 50}...{/if}</div> -->
          </div>
        </div>
      </div>
      {/if}
    
      {#if socialDescription || shortDescription}
        <div class="bg-slate-50 p-4 content-notion-wide">
          <!-- profile area -->
          <!-- DEPRECATED: Use socialLinks instead
            {#if socialDescription}
            <div class="SocialDescription mb-4">
              {@html marked(socialDescription || '')}
            </div>
          {/if} -->
          {#if shortDescription}
            <div class="ShortDescription">
              {@html marked(shortDescription || '')}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- display posts before anything else, if we don't have subsections -->
    <!-- update: instead of grouping them, now allowing multiple sections of posts, if theye're inserted at diff. places -->
    <!-- {#if blog && blog['site-pages'] && sections.length == 0}
      <div class="Posts | my-2 | content-notion-wide | overflow-hidden ">
        <div class="p-4 bg-slate-50">
          <h2 class="pt-0 mt-0">{"Posts"}</h2>
          <Posts posts={blog['site-pages'].filter(page => page.Type == "Posts" && !page.Hide)} pathBase={blogpath}></Posts>
        </div>
      </div>
    {/if} -->


    <!-- {#each sitePages as page} -->
    {#each pageOrder as page}
      {@const settings = page?.YAML && YAML.parse(page?.YAML) || {}}
      {#if page.Name && page.Hide !== true}

        <!-- special rows outside of standard row; for formatting usually -->
        {#if page.Type?.includes('Header')}
          <div class="Profile-Row--Header | {settings?.row?.container?.class || 'mt-2 mb-0 content-notion-wide'} | overflow-hidden | ">
            <div class="Header | {settings?.row?.class || 'p-4 bg-slate-50'} ">
              <div class="Profile-Header {settings?.row?.header?.class || ' font-sans leading-tight text-lg mb-2 font-bold pt-0 mt-0'}">{page.Name}</div>
            </div>
          </div>
        {:else}
          <!-- each row NEEDS something in the name -->
          <div class="Profile-Row | {settings?.row?.container?.class || 'mb-2 content-notion-wide'} | overflow-hidden | ">
            <!-- {page.Name} -->
            {#if page.Type?.includes('Main')}
              {#if page.Type.includes("Private") && !$userData['Email']}
                <!-- alternatively show an error message for Private pages when user isn't logged in -->
                <!-- <div class="text-red-500">This page is private. Please log in to view.</div> -->
              {:else if page.Type.includes("Public") && $userData['Email']}
                <!-- hide public pages when user is logged in -->
              {:else}
                <div class="MainPage | {settings?.row?.class || 'p-4 bg-slate-50'} ">
                  {#if (!page.Type.includes("#noheader") && !page.Attributes?.includes("noheader")) && page.Name !=='undefined'}
                    <!-- used to be h2 -->
                    <div class="Profile-Title {settings?.row?.header?.class || ' font-sans leading-tight text-2xl mb-2 font-bold pt-0 mt-0'}">{page.Name}</div>
                  {/if}
                  <Notion 
                    blocks={page.pageBlocks} 
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
            {:else if page.Type?.includes('Group')}
              {#if page.Type.includes("Private") && !$userData['Email']}
                <!-- do nothing -->
              {:else if page.Type.includes("Public") && $userData['Email']}
                <!-- do nothing -->
              {:else}
                <div class="Profile-Posts | {settings?.row?.class || 'my-2 p-4 | bg-slate-50 | overflow-hidden'} ">
                  <h5 class="pt-0 mt-0">{page.Group}</h5>
                  {#if page.SectionDescription}<p class="pb-8">{page.SectionDescription}</p>{/if}
                  <Posts posts={page.Pages.filter(page => page.Type?.includes("Posts") && !page.Hide)} pathBase={blogpath}></Posts>
                  <!-- {#each page.pages as groupPage}
                  {/each} -->
                </div>
              {/if}
            {:else if page.Type?.includes('Posts')}
              {#if page.Type.includes("Private") && !$userData['Email']}
                <!-- do nothing -->
              {:else if page.Type.includes("Public") && $userData['Email']}
                <!-- do nothing -->
              {:else}
                <!-- loose posts are NOT grouped together unless given a section -->
                <div class="TypeContainer | {settings?.row?.class || 'p-4 bg-slate-50'}">
                  <Posts posts={[page]} pathBase={blogpath} PostItemClasses={""}></Posts>
                </div>
              {/if}
            <!-- {:else if page.Type?.includes('Component') && page.Hide !== true} -->
            {:else if page['Type']?.some(type => componentTypes.includes(type)) && !page.Hide }
              <RenderComponent {page} />
            {/if}
          </div>
        {/if}
      {/if}
    {/each}
    
    
    <!-- 
    {#each sitePageTypes as type}
      <div class="TypeSection | my-2 content-notion-wide | overflow-hidden | ">
        {#if type=='Main'}
          <div class="MainPage | p-4 bg-slate-50 ">
            <h2 class="pt-0 mt-0">{type}</h2>
            <Notion blocks={mainPageBlocks} api="//notion-cloudflare-worker.yawnxyz.workers.dev"></Notion>
          </div>
        {:else}
          <div class="TypeContainer | p-4 bg-slate-50">
            <h2 class="pt-0 mt-0">{type}</h2>
          </div>
        {/if}
      </div>
    {/each} -->
  </div>
{/if}














<script>
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  
  import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  // import Notion from '@yawnxyz/sveltekit-notion';
  import { getNotionImageLink } from '$lib/helpers.js'
  import { userData } from '$lib/stores.js'

  import RenderComponent from '$lib/components/RenderComponent.svelte';
  // import Login from '$lib/components/forms/Login.svelte';
  // import MemberList from '$lib/components/MemberList.svelte';
  // import GridItems from '$lib/components/GridItems.svelte';
  // import Expander from '$lib/components/Expander.svelte';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'

  import YAML from 'yaml'


  import { marked } from 'marked';
  marked.use({
    breaks: true,
  });

  import { componentTypes } from '$lib/componentTypes.js';
  import Posts from '$lib/components/Posts.svelte';

  let blog = $page.data.blog;
  let profileImage = getNotionImageLink(blog?.['site-data']?.['ProfileImage']);
  let coverImage = getNotionImageLink(blog?.['site-data']?.['CoverImage']);
  let author = blog?.['site-data']?.Author?.['Content'];
  let shortDesc = blog?.['site-data']?.ShortDescription?.['Content'];
  let location = blog?.['site-data']?.Location?.['Content'];
  let socialDescription = blog?.['site-data']?.SocialDescription?.['Content'];
  let shortDescription = blog?.['site-data']?.LongDescription?.['Content'];
  let mainPageBlocks = blog?.['site-pages']?.find(page => page.Type?.includes("Main"))?.pageBlocks;
  let email = blog?.['site-data']?.Email?.['Content'];
  let socialLinks = blog?.['site-data']?.SocialLinks?.['Content'];
  let sitePages = blog?.['site-pages'];
  let blogpath = $page.data?.pathSegments ? `/${$page.data?.path}/` : "/";
  let styles = blog?.['site-data']?.Styles?.['YAML'];

  if (browser && styles) {
    styles = YAML.parse(styles);
    if (styles?.css) {
      Object.entries(styles.css).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }
 
  let sitePageByType = {}, sitePageTypes = [];
  blog?.['site-pages']?.forEach(page => {
    sitePageTypes = [...sitePageTypes, ...page.Type];
    if(!sitePageByType[page.Type]) {
      sitePageByType[page.Type] = [];
    }
    sitePageByType[page.Type].push(page);
  });
  sitePageTypes = [...new Set(sitePageTypes)]; 

  // if(browser && $page.data) console.log('%% PROFILE PageData', $page.data)

  // build a Page Order where different sections are grouped together and placed where the first instance of that section appears
  let pageOrder = [], sections = [];
  function buildPageOrer() {
    // build the sections list
    sitePages?.forEach(page => {
      if (page.Type) {
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
  } buildPageOrer()

  // function buildMetadata() {
  //   /*
  //     pages can have a page.Metadata which either looks like a JSON or a \n separated list of key/val pairs, e.g. coverStyle: small
  //   */
  //   sitePages.forEach((page,i) => {
  //     if(page.Metadata) {
  //       sitePages[i].MetadataObj = parseMetadata(page.Metadata)
  //     }
  //   })
  // } buildMetadata();




</script>






<style lang="scss" global>

  .content-pad {
    @apply px-8 md:px-32 py-8 mx-auto;
    // max-width: var(--notion-page-width);
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

  .MainPage {
    h2, h3, h4 {
      &:first-of-type {
        @apply pt-1; // tiny padding for first header keeps it tighter
      }
    }
  }

</style>