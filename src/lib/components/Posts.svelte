
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
  <div class="Posts-list | ">
    {#each posts as post}
      <div class="Posts-item | {PostItemClasses}">
        <div class="text-lg">
          <a href={`${pathBase}${post.Path}`}>
            {#if post.Cover}
              <div class="Cover-image-container | pb-2">
                <img class="Cover-image" src="{post.Cover}" alt="Cover"/>
              </div>
            {/if}
            {post.Name}
          </a>
        </div>

        {#if post.Content}<div class="text pt-1">{@html marked(post.Content || '')}</div>{/if}
        {#if post.AuthorName && post.AuthorName !== 'undefined' }
          <div class="Posts-Author | mb-8 flex items-center">
            {#if post.AuthorProfile?.[0] }
              <div class="rounded-full overflow-hidden mr-2">
                <img class="w-8 h-8" src="{post.AuthorProfile?.[0]?.rawUrl || post.AuthorProfile?.[0]?.rawUrl}" alt="Author Profile" />
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

  export let posts;
  export let pathBase = "/";
  export let PostItemClasses = "mb-4";
  
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
</style>