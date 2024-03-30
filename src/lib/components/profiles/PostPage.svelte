
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
  {#if currentPost}
    <title>{marked(currentPost?.Name || '', {renderer: plainRenderer()})}</title>
  {/if}
  {#if currentPost?.['Type'] == 'Component'} 
    <title>{blogData?.head.title}</title>
  {/if}
</svelte:head>

<div class="PagePath PageContent | mb-16">

  {#if blog?.settings?.hideProfileStack != true}
    <!-- BACK LINK -->
    <div class="ProfileStack | mb-16">
      <a href="{blogPath}" style="" class="flex items-center">
        {#if profileImage}
          <div class="ProfileImage |">
            <img class="w-16 h-16 | inline-block | object-cover rounded-full border-solid border-4 border-white overflow-hidden" src="{profileImage}" alt="Profile" />
          </div>
        {/if}<div class="text-lg font-medium | inline-block ml-2">{author}</div>
      </a>
    </div>
  {/if}

  {#if pageCover && settings?.post?.hideCover != true}
    <div class="CoverImage-container | mt-4">
      <img alt="CoverImage header " src="{pageCover}" />
    </div>
  {/if}

  {#if currentPost?.Date}
    <div class="PageContent-Date mb-1 mt-16">
      {niceDate(currentPost?.Date.start_date)}
      {#if currentPost?.LastEdited?.start_date && dayjs(currentPost?.LastEdited?.start_date).isAfter(dayjs(currentPost?.Date.start_date))}
        — edited: {niceDate(currentPost?.LastEdited?.start_date)}
      {/if}
    </div>
  {/if}

  {#if currentPost?.Name}
    <h1 class="PageContent-Name {settings?.post?.page?.title?.class || 'mb-0 pfix'}" style="padding-top: 0; padding-bottom: 0;">{@html md.strip(md.render(currentPost?.Name||''))}</h1>
  {/if}


  {#if currentPost.AuthorName && currentPost.AuthorName !== 'undefined' }

    {#if currentPost.AuthorName.includes('\n')}
      {#each currentPost.AuthorName.split('\n') as name, index}
        <div class="flex items-center mb-1">
          {#if currentPost.AuthorProfile?.[index]}
            <div class="rounded-full overflow-hidden mr-2">
              <img class="w-8 h-8" src="{currentPost.AuthorProfile[index]?.rawUrl || currentPost.AuthorProfile[index]?.url}" alt="Author Profile" />
            </div>
          {/if}
          <div>{name}</div>
        </div>
      {/each}
    {:else}
      <div class="Posts-Author | mt-1 mb-4 flex items-center">
        {#if currentPost.AuthorProfile?.[0] }
          <div class="rounded-full overflow-hidden mr-2">
            <img class="w-8 h-8" src="{currentPost.AuthorProfile?.[0]?.rawUrl || currentPost.AuthorProfile?.[0]?.url}" alt="Author Profile" />
          </div>
        {/if}
        {#if currentPost.AuthorName && currentPost.AuthorName !== 'undefined' }
          <div>{currentPost.AuthorName}</div>
        {/if}
      </div>
    {/if}
  {/if}


  {#if currentPost.Categories }
    {#if Array.isArray(currentPost.Categories) && currentPost.Categories.length > 0}
      {#each currentPost.Categories as cat}
        <span class="Category text-xs py-2 px-2 text-gray-800 bg-gray-100 border-gray-100 | mr-2">{cat}</span>
      {/each}
    {:else}
      <span class="Category text-xs py-2 px-2 text-gray-800 bg-gray-100 border-gray-100 | mr-2">{currentPost.Categories}</span>
    {/if}
  {/if}

  
  {#if currentPost?.Content}
    <div class="PageContent-Content text-xl">{@html md.render(currentPost?.Content)}</div>
  {/if}

  {#if currentPost?.Link}
    <div class="PageContent-Link my-4"><a href="{currentPost?.Link}">{currentPost?.Link}</a></div>
  {/if}
  
  {#if pageBlocks}
    <div class="PageContent-Blocks post | my-4">
      <Notion classes="notion" loud={true} blocks={pageBlocks} ></Notion>
    </div>
  {/if} 

  {#if showSectionPosts && (prevPost || nextPost)}
    <div class="PageContent-SectionPosts | mt-4 mb-16 | ">
      <div class="text-sm pb-2">
        {sectionName} Posts
      </div>
      <div class="md:grid grid-cols-2 gap-2">
        <div>
          {#if prevPost}
            <a href="{blogPath}{prevPost.Path}" class="Btn-link h-full w-full | PageContent-SectionPosts-Post SectionPosts-Prev rounded-md p-2 block mb-2" >
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Prev</div>
              <div class="text-lg pb-1">{prevPost.Name}</div>
              <div class="text-sm">{prevPost.Content||''}</div>
            </a>
          {:else}
            <div class="border-2 border-slate-200 text-slate-300 cursor-default h-full w-full | rounded-md p-2 block mb-2">
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Prev</div>
              <div class="text-lg pb-1">No more posts!</div>
            </div>
          {/if}
        </div>
        <div>
          {#if nextPost}
            <a href="{blogPath}{nextPost.Path}" class="Btn-link h-full w-full | PageContent-SectionPosts-Post SectionPosts-Next rounded-md p-2 block mb-2" >
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Next</div>
              <div class="text-lg pb-1">{nextPost.Name}</div>
              <div class="text-sm">{nextPost.Content||''}</div>
            </a>
          {:else}
            <div class="border-2 border-slate-200 text-slate-300 cursor-default h-full w-full | rounded-md p-2 block mb-2">
              <div class="text-xs pb-1 uppercase font-semibold tracking-wider">Prev</div>
              <div class="text-lg pb-1">No more posts!</div>
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
  import { parseYaml, getNotionImageLink } from '$lib/helpers.js'
  import { niceDate } from '$plasmid/utils/date'
  import { page } from '$app/stores';

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

  import { md } from '$plasmid/utils/markdownit'
  import dayjs from 'dayjs'

  let blog, profileImage, author, pageCover
  let blogData = getContext('blogData'); // blogData will have slightly out of date content like path

  // Check if the pathSegments length is greater than 1, if so, use the second element as the postPath
  // This ensures that the postPath is updated correctly when navigating to a new blog page
  // let blogPath = blogData.pathSegments?.length > 1 ? `/${blogData.pathSegments[1]}` : blogData.path; // /yawnxyz
  let blogPath = blogData?.blogPath + "/"; // /yawnxyz
  if(blogPath === "//") 
    blogPath = "/" // this happens on base blogalog.net; handle it manually
  
  export let postPath; // this is from fresh page.server.js path data + content, not from getContext / yawnxyz/blog

  let showSectionPosts = true

  blog = blogData?.blog; // await streamed blog, and set it here
  let currentPost = blog?.['site-pages'].find(item => item.Path === postPath) || {}
  profileImage = getNotionImageLink(blog?.['site-data']?.['ProfileImage'])
  pageCover = getNotionImageLink(currentPost) || currentPost?.['Cover']
  author = blog?.['site-data'].Author?.['Content'];
  if (dev && browser) console.log('[dev][path] PostPage blogData: ', blogData, currentPost)
  let pageBlocks = blogData.blog?.crossPages[currentPost?.CrossPageId] || currentPost?.pageBlocks

  export let settings
  if(currentPost?.YAML) {
    settings = parseYaml(currentPost?.YAML)
  } else {
    if(blogData.blog?.['site-data']?.Settings?.['YAML']) {
      settings = parseYaml(blogData.blog?.['site-data']?.Settings?.['YAML']);

    }
  }


  let sectionPosts = blog?.['site-pages'].map(item => {
    if(!item?.Section || !currentPost?.Section) return null
    if(item?.Section === currentPost?.Section) {
      return item;
    }
  }).filter(item => item && item.Hide != true)
  let sectionName = currentPost?.Section
  let currentPostIndex = sectionPosts?.findIndex(item => item.Path === postPath)
  let prevPost = sectionPosts?.[currentPostIndex-1];
  let nextPost = sectionPosts?.[currentPostIndex+1];
  // console.log('123 &*&*&*&&*&** sectionPages / blogData', blog['site-pages'], sectionPosts, prevPost, nextPost);
  // needs to catch both /base/project/post vs. /project/post and go one step up
  // console.log('currentPost:', currentPost)
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