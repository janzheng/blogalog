

<svelte:head>
  {#if blogData.pageContent}
    <title>{marked(blogData.pageContent?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
  {#if blogData.pageContent?.Type == 'Component'} 
    <title>{blogData.head.title}</title>
  {/if}


  {#if pageFonts && pageFonts.length > 0}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {#each pageFonts as font}
      <link href="https://fonts.googleapis.com/css2?family={font}" rel="stylesheet">
    {/each}
  {/if}
</svelte:head>


<!-- blogPath: {blogData.blogPath} | {$page?.data?.pathSegments} -->
<div class="Blogalog-Container {settings?.project?.class||''}"
  style="{blogalogStyleString+";"||''} {heightOfFooter ? `min-height: calc(100vh - ${heightOfFooter + 20}px);` : ''}"
  id="main"
  tabindex="-1"
  >

  {#if blogData?.menu && blogData?.menu?.global}
    <Menu />
  {/if}


  <!-- blogPath: {blogData?.blogPath} [{$page?.data?.pathSegments?.[0]}] ||| postPath: {$page.data?.path} -->

  <!-- LANDING PAGE // PROFILE PAGE
    e.g. https://jess.bio
  -->
  {#if isHomepage}
    <Profile />
    {#if blogData.hideFooter !== true}
      <Footer pageType='profile' bind:clientHeight={heightOfFooter} />
    {/if}
  {/if}

  <!-- blog post or sub-page post, from a leaf route -->
  {#if blogData.path && isHomepage!==true && (blogData.pageContent || blogData.pageGroup)}
    <!-- {#if $page?.data.pageContent['Type'] == 'Component'  ['Grid'].includes($page?.data.pageContent['Name'])} -->
    <!-- Render custom Page Group -->
    {#if blogData.pageGroup && blogData.pageGroup.length > 0}
      <PageGroup sitePages={blogData.pageGroup} />
    {:else if blogData.pageContent?.Type?.some(type => componentTypes.includes(type)) || ['Grid'].includes(blogData.pageContent?.Name)}
      <!-- Display Component as a page -->
      <!-- SPECIAL COMPONENT HERE: {$page?.data.pageContent['Name']} | {$page.data.path} | {$page.data.subPath} -->
      <!-- this is for SUBPATHS like member/slug or products loaded from separate databases -->
      <ComponentPage />
      {#if blogData.hideFooter !== true}
        <Footer pageType='component' bind:clientHeight={heightOfFooter} />
      {/if}
    {:else}
      <!-- Display Post -->
      <PostPage postPath={$page.data?.path} />
      {#if blogData.hideFooter !== true}
        <Footer pageType='post' bind:clientHeight={heightOfFooter} />
      {/if}
    {/if}
  {/if}
</div>

{#if isDev}
<!-- refresh / reload mechanism for faster building -->
  <div class="Refresher-float bottom-float">
    <Refresher data={$page?.data} />
  </div>
{/if}





<script>

  import { setContext } from 'svelte';
  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import { dev, browser } from '$app/environment'; 
  import { PUBLIC_BLOGMODE } from '$env/static/public';
  import { parseYaml, getNotionImageLink, generatePageStyles, slideUp } from '$lib/helpers.js'
  // import { niceDate } from '$plasmid/utils/date'

  import Menu from '$lib/components/Menu.svelte';
  
  // import YAML from 'yaml'
  import { componentTypes } from '$lib/componentTypes.js';
  import Profile from '$lib/components/profiles/ProfilePage.svelte';
  import ComponentPage from '$lib/components/profiles/ComponentPage.svelte';
  import PageGroup from '$lib/components/profiles/PageGroup.svelte';
  import PostPage from '$lib/components/profiles/PostPage.svelte';
	import Footer from '$lib/layouts/BlogalogFooter.svelte';
  import Refresher from '$lib/components/Refresher.svelte';

  import { plainRenderer } from '$plasmid/utils/marked';

  export let page;
  // import { page } from '$app/stores'

  // set &dev==true in the URL for devtastic goodness
  export let isDev = dev || $page.url.searchParams.get('dev') === 'true';
  

  export let isHomepage = $page?.data?.isBlogalogHome;

  slideUp(onMount); // for elements that slide up; apply [.slideupContainer] to direct parent container

  // reminder: this is by itself NOT REACTIVE, which will speed up some pages
  // to make it reactive, use the passthru $page prop
  export let blogData = {
    page,
    head: $page.data?.head,
    data: $page.data,
    path: $page.data?.path,
    pathSegments: $page.data?.pathSegments,
    // blogPath: $page?.data?.pathSegments?.length>1 ? `/${$page?.data?.pathSegments[0]}` : "/",
    blogPath: $page?.data?.pathSegments?.length>=1 ? `/${$page?.data?.pathSegments[$page?.data?.pathSegments?.length-2]||''}` : "/",
    pageContent: $page?.data?.pageContent,
    pageGroup: $page?.data?.pageGroup,
    blog: $page?.data?.blog, // await streamed blog, and set it here
    profileImage: getNotionImageLink($page?.data?.blog?.['site-data']?.['ProfileImage']),
    pageCover: getNotionImageLink($page?.data?.pageContent) || $page?.data?.pageContent?.['Cover'],
    author: $page?.data?.blog?.['site-data'].Author?.['Content'],
    srcLayout: true, // for tracking/provenance
  }
  if($page?.data?.pathSegments?.length>=1) {
    if ($page?.data?.isBlogalogHome) {
      blogData['blogPath'] = `/${$page?.data?.pathSegments[0]}`
    } else {
      blogData['blogPath'] = `/${$page?.data?.pathSegments[$page?.data?.pathSegments?.length-2]||''}`;
    }
  }


  let settings
//   settings = `
// page:
//   'blogalog-page-width': '1500px'
//   'color-base': 'orange'
//   'color-title': 'purple'
//   'color-bg': '#3B3C4C'
//   'color-primary': '#3b82f6'
//   'color-primary-hover': '#1d4ed8'
//   'color-primary-active': '#1e40af'
//   'color-primary-light': '#bfdbfe'
//   'color-primary-dark': '#1e40af'
//   'color-primary-ring': '#dbeafe'
//   'color-primary-ring-active': '#60a5fa'
//   'color-primary-text': 'white'
    
// profile:
//   showHeader: false
//   class:
//     header: content-notion-wide | mt-0 rounded-sm overflow-hidden
//     coverContainer: max-h-96 overflow-hidden object-cover | flex justify-center items-center
//     coverImage:  w-full object-cover object-center
// `
  settings = blogData.blog?.['site-data']?.Settings?.['YAML'];
  
  let pageStyles, pageStylesString = '', blogalogStyleString='';
  let pageFonts = '';


  if (settings) {

    // settings.cssVars — css variables are set into the document itself
    settings = parseYaml(settings);

    // settings.page — page display settings
    if(settings && settings.page) {
      // pageStyles = generatePageStyles(settings.page);
      pageStylesString = generatePageStyles(settings.page, {type: 'string'});
      blogalogStyleString = pageStylesString; // causes FOUC
      pageFonts = settings.page.fonts;
    }

    blogData['settings'] = settings // <---- most components will use this 
    blogData['blogalogPageStyles'] = pageStylesString // for referencing
  }

  if (blogData.blog?.['site-data']?.Menu) {
    blogData['menu'] = parseYaml(blogData.blog?.['site-data']?.Menu?.YAML) // site menu
  }


  setContext('blogData', blogData);

  // onMount(() => {
  //   if (settings && browser && pageStyles) {
  //     // This code will now run only on the client side
  //     Object.entries(pageStyles).forEach(([key, value]) => {
  //       // causes FOUC
  //       console.log('Applying style:', key, value);
  //       document.documentElement.style.setProperty(key, value);
  //     });

  //     let element = document.querySelector('.Blogalog-Container');
  //     console.log('Blogalog-Container:', element);
  //     if (element) {
  //       Object.entries(pageStyles).forEach(([key, value]) => {
  //         console.log('Applying style:', key, value);
  //         element.style.setProperty(key, value);
  //       });
  //     } else {
  //       console.log('Element not found');
  //     }
  //   }
  // });


  $: if(dev && browser) console.log('[dev][blogalog.svelte] blogData:', blogData)

  let heightOfFooter


  // onMount(() => {
    // if (pageStyles) {
    //   Object.entries(pageStyles).forEach(([key, value]) => {
    //     document.documentElement.style.setProperty(key, value);
    //   });
    // }
  // });



</script>

 

<style lang="scss" global>

  html {
    // creates smooth scrolling w/o js
    scroll-behavior: smooth;
  }

  // required for "slide up" animation to work
  .slideup, .slideupContainer > * {
    opacity: 0;
    transform: translateY(var(--slideup-distance));
    transition: opacity var(--slideup-duration) ease, transform var(--slideup-duration) ease;
  }

  .slideup.visible, .slideupContainer > .visible {
    opacity: 1;
    transform: translateY(0);
  }

  .Refresher-float {
    @apply fixed bottom-0 bg-white bg-opacity-60 rounded-md p-2 m-2;
  }

</style>