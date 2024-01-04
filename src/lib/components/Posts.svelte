
<!-- 

  Home page index list

 -->

<!-- <div class="font-serif text-2xl pb-4 antialiased">Posts</div> -->
<!-- 
<p>Many years ago, I’ve built and designed landing pages, producs, web apps, and internal products for various brands.
</p><p>In the last few years, I’ve been running a crowd-sourced phage therapy community project called Phage Directory, and I’ve built a few phage and biotech related projects.
</p> -->

{#if posts}
  <!-- <div class="Posts-list | lg:grid grid-cols-3 gap-8"> -->
  <div class="Posts Posts-list | ">
    {#each posts as post}
      <div class="Post-item | {PostItemClasses} coverStyle_{post.MetaObj?.coverStyle} | {""}">
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
              <span class="Post-name font-title text-2xl pfix">{@html marked(post.Name)}</span>
              {#if post.Date}
                <span class="Post-date text text-base text-sm pfix">{niceDate(post.Date?.start_date)}</span>
              {/if}
              {#if post.Content}<div class="Post-content text pfix mt-1 mb-2 text-base">{@html marked(post.Content || '')}</div>{/if}
            
            {:else}
              <!-- default -->
              <!-- small inline cover where it's on the left side -->
              <div class="flex justify-between gap-4 | {(post.Cover || post.Files) && "md:grid md:grid-cols-1-3"}">
                {#if post.Cover || post.Files}
                  <div class="Cover-image-container | pb-2 max-w-sm">
                    <img class="Cover-image" src="{getCover(post)}" alt="Cover"/>
                  </div>
                {/if}
                <div>
                  <span class="Post-name font-title text-2xl pfix">{@html marked(post.Name||'')}</span>
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
          <div class="Posts-Author | mt-1 mb-4 flex items-center">
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

        {#if post.Categories }
          {#if Array.isArray(post.Categories) && post.Categories.length > 0}
            <!-- {#each post.Categories.split(",").map(cat => cat.trim()) as cat} -->
            {#each post.Categories as cat}
              <span class="Category text-xs py-2 px-2 text-gray-800 bg-gray-100 border-gray-100 | mr-2">{cat}</span>
            {/each}
          {:else}
            <span class="Category text-xs py-2 px-2 text-gray-800 bg-gray-100 border-gray-100 | mr-2">{post.Categories}</span>
          {/if}
        {/if}

      </div>
    {/each}
  </div>
{/if}


<script>
  import { getContext } from 'svelte';
  import { marked } from 'marked';
  import { getNotionImageLink } from '$lib/helpers.js';
  import { niceDate } from '$plasmid/utils/date';

  let blogData = getContext('blogData');

  export let posts;
  // export let settings;
  let blogPath = blogData?.blogPath + "/";
  if(blogPath === "//") 
    blogPath = "/" // this happens on base blogalog.net; handle it manually

  export let PostItemClasses = "";

  function getCover(post) {
    return getNotionImageLink(post);
  }

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
          text-decoration: underline;
        }
      }
    }

    &+.Post-item {
      @apply mt-8;
    }
  }
  // .Post-content {
  //   text-decoration: none !important;
  // }
</style>