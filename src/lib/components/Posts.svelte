
<!-- 

  Home page index list

 -->

<!-- <div class="font-serif text-2xl pb-4 antialiased">Posts</div> -->
<!-- 
<p>Many years ago, I’ve built and designed landing pages, producs, web apps, and internal products for various brands.
</p><p>In the last few years, I’ve been running a crowd-sourced phage therapy community project called Phage Directory, and I’ve built a few phage and biotech related projects.
</p> -->


<!-- 
  pgho

  Posts Posts-list grid grid-cols-2 gap-4 |  s-G8Aqw6ntKAYR
    Post-item | bg-white p-2 border-2 border-slate-200 rounded-md coverStyle_undefined |  s-G8Aqw6ntKAYR 
      Posts-Author | mt-1 flex items-center s-G8Aqw6ntKAYR

 -->

{#if posts}
  <!-- <div class="Posts-list | lg:grid grid-cols-3 gap-8"> -->
  <!-- <pre>postsSettings: {JSON.stringify(postsSettings, 0, 2)}</pre> -->
  <div class="Posts Posts-list | {postsSettings?.posts?.class || ''} ">
    {#each posts as post}
      <div class="Post-item | {postsSettings?.post?.class || 'mb-8'} ">
        <div class="">
          <!-- -!!- blogPath[{blogPath}] - {post.Path} -->
          <a href={`${blogPath}${post.Path}`}>
            {#if post.Type?.includes("CoverPost")}
              <!-- large image cover -->
              {#if post.Cover || post.Files}
                <div class="Cover-image-container | pb-2">
                  <img class="Cover-image" src="{getCover(post)}" alt="Cover"/>
                </div>
              {/if}
              <span class="Post-name { postsSettings?.post?.name?.class || 'font-title text-2xl pfix'}">{@html marked(post.Name)}</span>
              {#if post.Date}
                <span class="Post-date text text-base text-sm pfix">{niceDate(post.Date?.start_date)}</span>
              {/if}
              {#if post.Content}<div class="Post-content text pfix mt-1 mb-2 text-base">{@html marked(post.Content || '')}</div>{/if}
            
            {:else}
              <!-- default -->
              <!-- small inline cover where it's on the left side -->
              <!-- this will mess with a lot of blog posts -->
              <!-- <div class="Post-main {postsSettings?.post?.main?.class || ' flex justify-between gap-4'} | {(post.Cover || post.Files) && "md:grid md:grid-cols-1-3"}"> -->
              <div class="Post-main {postsSettings?.post?.main?.class || ' flex justify-between gap-4'}">
                {#if post.Cover || post.Files}
                  <div class="Cover-image-container | {postsSettings?.post?.main?.cover?.class || ' pb-2 max-w-sm'}">
                    <img class="Cover-image" src="{getCover(post)}" alt="Cover"/>
                  </div>
                {/if}
                <div>
                  <span class="Post-name { postsSettings?.post?.name?.class || 'font-title text-2xl pfix'}">{@html marked(post.Name||'')}</span>
                  {#if post?.Date}
                    <span class="Post-date text text-base text-sm pfix">{niceDate(post.Date?.start_date)}</span>
                  {/if}
                  {#if post.Content}<div class="Post-content text pt-1 text-base">{@html marked(post.Content || '')}</div>{/if}
                </div>
              </div>
            {/if}
          </a>
        </div>

        {#if post.AuthorName && post.AuthorName !== 'undefined' }

          {#if post.AuthorName.includes('\n')}
            {#each post.AuthorName.split('\n') as name, index}
              <div class="flex items-center mb-1">
                {#if post.AuthorProfile?.[index]}
                  <div class="rounded-full overflow-hidden mr-2">
                    <img class="w-8 h-8" src="{post.AuthorProfile[index]?.rawUrl || post.AuthorProfile[index]?.url}" alt="Author Profile" />
                  </div>
                {/if}
                <div>{name}</div>
              </div>
            {/each}
          {:else}
            <div class="Posts-Author | { postsSettings?.post?.author?.class || 'mt-1 mb-4 flex items-center'}">
              {#if post.AuthorProfile?.[0] }
                <div class="rounded-full overflow-hidden mr-2">
                  <img class="w-8 h-8" src="{post.AuthorProfile?.[0]?.rawUrl || post.AuthorProfile?.[0]?.url}" alt="Author Profile" />
                </div>
              {/if}
              {#if post.AuthorName && post.AuthorName !== 'undefined' }
                <div>{post.AuthorName}</div>
              {/if}
            </div>
          {/if}
        {/if} 

        {#if post.Categories }
          <div class="Category-container | { postsSettings?.post?.category?.container?.class || '-mt-2'}">
            {#if Array.isArray(post.Categories) && post.Categories.length > 0}
              <!-- {#each post.Categories.split(",").map(cat => cat.trim()) as cat} -->
              {#each post.Categories as cat}
                <span class="Category { postsSettings?.post?.category?.class || 'text-xs py-2 px-2 text-gray-800 bg-gray-100 border-gray-100 | mr-2'} ">{cat}</span>
              {/each}
            {:else}
              <span class="Category { postsSettings?.post?.category?.class || 'text-xs py-2 px-2 text-gray-800 bg-gray-100 border-gray-100 | mr-2'}">{post.Categories}</span>
            {/if}
          </div>
        {/if}

      </div>
    {/each}
  </div>
{/if}


<script>
  import { getContext } from 'svelte';
  import { marked } from 'marked';
  import { parseYaml, getNotionImageLink } from '$lib/helpers.js';
  import { niceDate } from '$plasmid/utils/date';

  let blogData = getContext('blogData');

  export let posts;
  // export let settings;
  let blogPath = blogData?.blogPath + "/";
  if(blogPath === "//") 
    blogPath = "/" // this happens on base blogalog.net; handle it manually

  function getCover(post) {
    return getNotionImageLink(post);
  }

  // for all posts settings / classes, we extract if from the first post in the group
  let settings = blogData?.settings
  let postsSettings = posts[0].YAML && parseYaml(posts[0].YAML) || settings;



</script>

<style lang="scss" global>
  @media (min-width: 1024px) {
    //   .Cover-image {
    //     height: 130px;
    //     width: 100%;
    //     object-fit: cover;
    //   }
    .Cover-image-container {
      // max-height: 240px;
      // max-height: 190px;
      overflow: hidden;
    }
  }

  // don't underline text
  .Post-item {
    a {
      text-decoration: none !important;

      &:hover {
        .Post-name {
          // text-decoration: underline;
          text-decoration: var(--link-hover-decoration, underline);
          text-decoration-thickness: var(--link-hover-decoration-thickness, auto);
        }
      }
    }

    // &+.Post-item {
    //   @apply mt-8;
    // }
  }
  // .Post-content {
  //   text-decoration: none !important;
  // }
</style>