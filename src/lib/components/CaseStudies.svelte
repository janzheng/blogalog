
<!-- 

  Home page index list

 -->

<div class="font-serif text-2xl pb-4 antialiased">Case Studies</div>

<p>Many years ago, I’ve built and designed landing pages, producs, web apps, and internal products for various brands.
</p><p>In the last few years, I’ve been running a crowd-sourced phage therapy community project called Phage Directory, and I’ve built a few phage and biotech related projects.
</p>

{#if caseStudies}
  <div class="CaseStudies-list | lg:grid grid-cols-3 gap-8">
    {#each caseStudies as caseStudy}
      <div class="CaseStudies-case | mb-8">
        <div class="font-serif text-xl">
          <a href="/{caseStudy.Path}">
            {#if caseStudy.Cover}
              <div class="Cover-image-container">
                <img class="Cover-image" src="{caseStudy.Cover}" alt="Cover"/>
              </div>
            {/if}
            {caseStudy.Name}
          </a></div>
        <div class="text-sm pt-2">{caseStudy.Description}</div>
      </div>
    {/each}
  </div>
{/if}


<script>

  export let caseStudies

</script>

<style lang="scss" global>
  @media (min-width: 1024px) {
    //   .Cover-image {
    //     height: 130px;
    //     width: 100%;
    //     object-fit: cover;
    //   }
    .Cover-image-container {
      max-height: 190px;
      overflow: hidden;
    }
  }
</style>