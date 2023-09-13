
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
      <div class="Post-item | {PostItemClasses} coverStyle_{post.MetaObj?.coverStyle}">
        <div class="">
          <a href={`${pathBase}${post.Path}`}>
            {#if post.MetaObj?.coverStyle == "inline"}
              <!-- small inline cover where it's on the right side -->
              <div class="flex justify-between gap-4">
                <div>
                  <span class="Post-name text-lg pfix">{@html marked(post.Name)}</span>
                  {#if post.Content}<div class="Post-content text pt-1 text-base">{@html marked(post.Content || '')}</div>{/if}
                </div>
                {#if post.Cover}
                  <div class="Cover-image-container | pb-2 max-w-sm">
                    <img class="Cover-image" src="{getCover(post)}" alt="Cover"/>
                  </div>
                {/if}
              </div>

            {:else}
              <!-- large image cover // regular -->
              {#if post.Cover || post.Files}
                <div class="Cover-image-container | pb-2">
                  <img class="Cover-image" src="{getCover(post)}" alt="Cover"/>
                </div>
              {/if}
              <span class="Post-name text-lg pfix">{@html marked(post.Name)}</span>
              {#if post.Content}<div class="Post-content text pt-1 text-base">{@html marked(post.Content || '')}</div>{/if}
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
      </div>
    {/each}
  </div>
{/if}


<script>
  import {marked} from 'marked';
  import { getNotionImageLink } from '$lib/helpers.js'

  export let posts;
  export let pathBase = "/";
  export let PostItemClasses = "mb-4";

  function getCover(post) {
    console.log('post cover:', post, 'derp', getNotionImageLink(post))
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
  }
  // .Post-content {
  //   text-decoration: none !important;
  // }
</style>