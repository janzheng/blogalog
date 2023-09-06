

<svelte:head>
  {#if $page.data.head}
    <title>{$page.data.head?.title}</title>
  {/if}
</svelte:head>


<div class="Profile-Header | content-notion-wide | mt-0 md:mt-2 lg:mt-4 rounded-sm overflow-hidden  ">
  <!-- cover -->
  {#if coverImage}
    <div class="CoverImage | min-h-[4rem] overflow-hidden">
      <img class="w-full object-left-top object-contain" src="{coverImage}" alt="Cover" />
    </div>
  {/if}
  
  <!-- profile -->
  {#if profileImage}
  <div class="ProfileImage-Container | relative bg-slate-100 ">
    <div class="ProfileImage | px-4 pt-4 | relative md:relative z-20 ">
      <img class="w-32 h-32 | bg-white object-cover rounded-full border-solid border-4 border-white overflow-hidden | absolute {coverImage ? ' -top-12' : ''}" src="{profileImage}" alt="Profile" />
      <div class="ProfileShortDesc | pt-20 sm:pt-0 sm:inline-block sm:relative sm:py-2 sm:ml-36 md:w-96">
        <div class="text-2xl sm:text-4xl font-bold py-2">{author || ''}</div>
        <div class="text">{siteDesc || ''}</div>
        <!-- <div class="text">{siteDesc?.substring(0, 50) || ''}{#if siteDesc?.length > 50}...{/if}</div> -->
      </div>
    </div>
  </div>
  {/if}

  <div class="bg-slate-100 p-4 content-notion-wide">
    <!-- profile area -->
    {#if socialDescription}
      <div class="mb-4">
        {@html marked(socialDescription || '')}
      </div>
    {/if}
    {#if shortDescription}
      {@html marked(shortDescription || '')}
    {/if}
  </div>
</div>

<!-- display posts before anything else, if we don't have subsections -->
<!-- update: instead of grouping them, now allowing multiple sections of posts, if theye're inserted at diff. places -->
<!-- {#if cytosis && cytosis['site-pages'] && sections.length == 0}
  <div class="Posts | my-2 | content-notion-wide | overflow-hidden ">
    <div class="p-4 bg-slate-50">
      <h2 class="pt-0 mt-0">{"Posts"}</h2>
      <Posts posts={cytosis['site-pages'].filter(page => page.Type == "Posts" && !page.Hide)} pathBase={blogpath}></Posts>
    </div>
  </div>
{/if} -->


<!-- {#each sitePages as page} -->
{#each pageOrder as page}
  <div class="Profile-Page | my-2 content-notion-wide | overflow-hidden | ">
    {#if page.Type=='Main' && !page.Hide}
      <div class="MainPage | p-4 bg-slate-50 ">
        <h2 class="pt-0 mt-0">{page.Name}</h2>
        <Notion blocks={page.pageBlocks} />
      </div>
    {:else if page.Type=='Group'}
      <div class="Profile-Posts | my-2 | content-notion-wide | overflow-hidden ">
        <div class="p-4 bg-slate-50">
          <h5 class="pt-0 mt-0">{page.Group}</h5>
          {#if page.SectionDescription}<p class="pb-8">{page.SectionDescription}</p>{/if}
          <Posts posts={page.Pages.filter(page => page.Type == "Posts" && !page.Hide)} pathBase={blogpath}></Posts>
          <!-- {#each page.pages as groupPage}
          {/each} -->
        </div>
      </div>
    {:else if page.Type=='Posts' && !page.Hide}
      <!-- do nothing; these are displayed elsewhere -->
      <div class="TypeContainer | p-4 bg-slate-50">
        <!-- <h4 class="pt-0 mt-0">{page.Name}</h4> -->
        <Posts posts={[page]} pathBase={blogpath} PostItemClasses={""}></Posts>
      </div>
    {/if}
  </div>
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




<script>
  import Notion from '@yawnxyz/sveltekit-notion';
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  import { marked } from 'marked';

  import Posts from '$lib/components/Posts.svelte';

  let cytosis = $page.data.cytosis;
  let profileImage = cytosis?.['site-data']?.['ProfileImage']?.Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url;
  let coverImage = cytosis?.['site-data']?.['CoverImage']?.Content || cytosis?.['site-data']?.['CoverImage'].Files?.[0].url;
  let author = cytosis?.['site-data']?.Author?.['Content'];
  let siteDesc = cytosis?.['site-data']?.ShortDescription?.['Content'];
  let socialDescription = cytosis?.['site-data']?.SocialDescription?.['Content'];
  let shortDescription = cytosis?.['site-data']?.LongDescription?.['Content'];
  let mainPageBlocks = cytosis?.['site-pages']?.find(page => page.Type?.includes("Main"))?.pageBlocks;
  let sitePages = cytosis?.['site-pages'];
  let blogpath = $page.data?.pathArr ? `/${$page.data?.path}/` : "/"

  let sitePageByType = {}, sitePageTypes = [];
  cytosis?.['site-pages']?.forEach(page => {
    sitePageTypes = [...sitePageTypes, ...page.Type];
    if(!sitePageByType[page.Type]) {
      sitePageByType[page.Type] = [];
    }
    sitePageByType[page.Type].push(page);
  });
  sitePageTypes = [...new Set(sitePageTypes)]; 

  if(browser) console.log('%% PROFILE PageData', $page.data)

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
          const newObject = { Group: section.Section, Type: ['Group'], Pages: section.pages, SectionDescription: section.SectionDescription };
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
    max-width: var(--notion-page-width);
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