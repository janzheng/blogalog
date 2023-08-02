
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
      <div class="Posts-case |">
        <div class="font-serif text-2xl">
          <a href={`${path}${post.Path}`}>
            {#if post.Cover}
              <div class="Cover-image-container | pb-2">
                <img class="Cover-image" src="{post.Cover}" alt="Cover"/>
              </div>
            {/if}
            {post.Name}
          </a></div>
        <div class="text pt-2">{@html marked(post.Content || '')}</div>
      </div>
    {/each}
  </div>
{/if}


<script>
  import {marked} from 'marked';

  export let posts;
  export let path = "/";

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