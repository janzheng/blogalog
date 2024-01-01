
<!-- 

  Displays blog posts, etc.

 -->


<!-- 
<svelte:head>
  {#if blogData.head}
    <title>{blogData.head?.title || 'Blog not found!'}</title>
  {/if}
</svelte:head>
 -->


<svelte:head>
  {#if blogData.pageContent}
    <title>{marked(blogData.pageContent?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
  {#if blogData.pageContent['Type'] == 'Component'} 
    <title>{blogData.head.title}</title>
  {/if}
</svelte:head>

<div class="PagePath PageContent | mb-16">

  <!-- BACK LINK -->
  <div class="ProfileStack | ">
    <a href="{blogPath}" style="" class="flex items-center">
      {#if profileImage}
        <div class="ProfileImage |">
          <img class="w-16 h-16 | inline-block | object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
        </div>
      {/if}<div class="text-lg font-medium | inline-block ml-2">{author}</div>
    </a>
  </div>

  {#if pageCover}
    <div class="CoverImage-container | mt-4">
      <img alt="CoverImage header " src="{pageCover}" />
    </div>
  {/if}

  {#if blogData.pageContent?.Date}
    <div class="PageContent-Date mb-1 pt-16">{niceDate(blogData.pageContent?.Date.start_date)}</div>
  {/if}

  {#if blogData.pageContent?.Name}
    <h1 class="PageContent-Name mb-0 pfix" style="padding-top: 0; padding-bottom: 0;">{@html marked(blogData.pageContent?.Name || '')}</h1>
  {/if}


  {#if blogData.pageContent?.Content}
    <div class="PageContent-Content text-xl">{blogData.pageContent?.Content}</div>
  {/if}

  {#if blogData.pageContent?.Link}
    <div class="PageContent-Link my-4">Project Link: <a href="{blogData.pageContent?.Link}">{blogData.pageContent?.Link}</a></div>
  {/if}
  
  {#if blogData.pageContent?.pageBlocks}
    <div class="PageContent-Blocks post | my-4">
      <Notion classes="notion" loud={true} blocks={blogData.pageContent?.pageBlocks} ></Notion>
    </div>
  {/if} 

  {#if showSectionPosts && (prevPost || nextPost)}
    <div class="PageContent-SectionPosts | mt-4 mb-16 | ">
      <div class="text-sm pb-2">
        More posts in {sectionName}
      </div>
      <div class="md:grid grid-cols-2 gap-2">
        <div>
          {#if prevPost}
            <a href="{blogPath}/{prevPost.Path}" class="Btn-link h-full w-full | PageContent-SectionPosts-Post SectionPosts-Prev rounded-md p-2 block mb-2" >
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Prev</div>
              <div class="text-lg pb-1">{prevPost.Name}</div>
              <div class="text-sm">{prevPost.Content}</div>
            </a>
          {:else}
            <div class="border-2 border-slate-200 text-slate-300 cursor-default h-full w-full | rounded-md p-2 block mb-2">
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Prev</div>
              <div class="text-lg pb-1">No post</div>
            </div>
          {/if}
        </div>
        <div>
          {#if nextPost}
            <a href="{blogPath}/{nextPost.Path}" class="Btn-link h-full w-full | PageContent-SectionPosts-Post SectionPosts-Next rounded-md p-2 block mb-2" >
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Next</div>
              <div class="text-lg pb-1">{nextPost.Name}</div>
              <div class="text-sm">{nextPost.Content}</div>
            </a>
          {:else}
            <div class="border-2 border-slate-200 text-slate-300 cursor-default h-full w-full | rounded-md p-2 block mb-2">
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Prev</div>
              <div class="text-lg pb-1">No post</div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- create an html details / summary example here -->
  <!-- skip if only one version -->
  <!-- {#if pageContent && blogData.pageContent?.versions && blogData.pageContent?.versions.length > 1}
    <div class="PageContent-Versions mt-4">
      <details>
        <summary>Versions</summary>
        {#each blogData.pageContent?.versions.slice(1) as version}
          <div class="post-version | mt-4 pl-8">
            <details>
              <summary>
                {#if version.Version}<span class="text-sm">{version.Version}</span> {/if}
                {#if version.VersionNotes}<span class="text-sm">{version.VersionNotes}</span>
                {/if}
                {#if version.Description}
                  <span class=""> — {version.Description}</span>
                {/if}
              </summary>
              {#if version.pageBlocks}
                <div class="pl-8">
                  <Notion classes="notion" blocks={version.pageBlocks}></Notion>
                </div>
              {/if}
            </details>  
          </div>
        {/each}
      </details>
    </div>
  {/if} -->

</div>














<script>

  import { marked } from 'marked'
	// import { onMount } from 'svelte';
  import { dev, browser } from '$app/environment'; 
  import { PUBLIC_BLOGMODE } from '$env/static/public';
  import { getNotionImageLink } from '$lib/helpers.js'
  import { niceDate } from '$plasmid/utils/date'

  import Notion from '@yawnxyz/sveltekit-notion'
  // import Notion from '@yawnxyz/sveltekit-notion/src/Notion.svelte'
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  
  // import RenderComponent from '$lib/components/RenderComponent.svelte';
  // import { componentTypes } from '$lib/componentTypes.js';
  // import Profile from '$lib/components/profiles/ProfilePage.svelte';
  // import ComponentPage from '$lib/components/profiles/ComponentPage.svelte';
  // import PostPage from '$lib/components/profiles/PostPage.svelte';

  import { plainRenderer } from '$plasmid/utils/marked';

  import { getContext } from 'svelte';

  let blogPath, blog, pageContent, profileImage, author, pageCover
  let blogData = getContext('blogData');

  let showSectionPosts = true

  blogPath = blogData?.pathSegments?.length>1 ? `/${blogData?.pathSegments[0]}` : "/"
  blog = blogData.blog; // await streamed blog, and set it here
  pageContent = blogData.pageContent
  profileImage = getNotionImageLink(blog?.['site-data']?.['ProfileImage'])
  pageCover = getNotionImageLink(pageContent) || pageContent?.['Cover']
  author = blog?.['site-data'].Author?.['Content'];
  if (dev && browser) console.log('[dev][path] PostPage blogData: ', blogData, pageContent)

  let sectionPosts = blog['site-pages'].map(item => {
    if(!item.Section || !pageContent.Section) return null

    if(item.Section === pageContent.Section) {
      console.log(pageContent.Section, '**---> ??!', item, item.Section); 
      return item;
    }
  }).filter(item => item && item.Hide != true)
  let sectionName = pageContent.Section
  let currentPostIndex = sectionPosts.findIndex(item => item.Path === blogData.path)
  let prevPost = sectionPosts[currentPostIndex-1];
  let nextPost = sectionPosts[currentPostIndex+1];
  console.log('sectionPages??', sectionPosts, prevPost, nextPost);


  // needs to catch both /base/project/post vs. /project/post and go one step up
  
  // $: pageContent = blogData.blog?.['site-pages'].find(item => item.Path === blogData.path || item.Path === blogData.pathSegments?.[blogData.pathSegments?.length -1]);
  // if(blogData.pageContent) pageContent = blogData.pageContent



  // if(browser) {
      // console.log('blog path DATA?!?!!??!:', data, pageContent)
  //   (async () => {
  //     blog = await blogData.streamed?.blog
  //     console.log('----> blog:', blog)
  //   })()
  // }

  // $: if(browser && blogData.streamed?.blog) {
  //   console.log('streamed.blog:', blogData.streamed?.blog)
  // }

</script>





<style lang="scss" global>

  .notion-callout-icon {
    align-self: flex-start;
  }
  .notion-page-icon {
    font-size: 1.7rem;;
  }

  .notion-bookmark {
    &, &:hover, a, a:hover {
      text-decoration: none !important;
    }
  }

  .Profile {
    background-color: var(--color-bg);
  }
  

</style>