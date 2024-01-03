<!-- 

  this will probably become a swappable footer, e.g. for unpaid members

 -->
<script>
  // import Icon from '@iconify/svelte';
  import YAML from 'yaml'
  import Notion from '@yawnxyz/sveltekit-notion';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'
  import { marked } from "marked";
  import { generatePageStyles } from '$lib/helpers.js'

  import { getContext } from 'svelte';

  export let pageType = 'profile'; // profile, component, post
  let blogData = getContext('blogData');
  let email = blogData?.blog?.['site-data']?.Email?.['Content'];
  let socialLinks = blogData?.blog?.['site-data']?.SocialLinks?.['Content'];
  let content = blogData?.blog?.['site-data']?.['Footer']?.Content;
  let pageBlocks = blogData?.blog?.['site-data']?.['Footer']?.pageBlocks;

//   let tmp = `
// page:
//   'color-primary': '#3b82f6'
//   'color-link': '#4b4b4b'
//   'color-link-hover': '#343CED'
//   'color-primary-active': '#1e40af'
//   'color-primary-light': '#bfdbfe'
//   'color-primary-dark': '#1e40af'
//   'color-primary-ring': '#dbeafe'
//   'color-primary-ring-active': '#60a5fa'
//   'color-primary-text': 'white'

// footer:
//   container:
//     sideBySide: true
//     style: "background-color: #F6F3EB"
//   blocks:
//     class: grow
//   bottom:
//     container:
//       class: "flex border-t-2 p-4 border-gray-200 color-gray-600 | content-notion-wide notion-sturdy-columnheaders"
//     left:
//       class: "flex flex-row gap-2"
//       markdown: "© 2023, Glean Technologies, Inc."
//     right:
//       class: "flex-1 text-right"
//       markdown: "[Terms](https://google.com) &emsp; [Privacy](https://google.com)"
//       `

  let settings = blogData?.settings
  let pageStyles
  if (blogData?.blog?.['site-data']?.['Footer']?.YAML) {
    settings = YAML.parse(blogData?.blog?.['site-data']?.['Footer']?.YAML)
    // settings = YAML.parse(tmp)
    pageStyles = generatePageStyles(settings.page, {type:'string'}) || null
  }

  export let clientHeight;
</script>


<!-- extract this into its own reusable component -->

<footer bind:clientHeight={clientHeight} 
  class="Component-Footer | "
    style={pageStyles + "; " + settings?.footer?.container?.style|| 'text-center mt-2 bg-slate-50'}
  >
  <div class="Component-Footer-Main
    { 
      (pageType=='profile' && (settings?.footer?.container?.class || 'content-notion-wide | py-4')) ||
      (pageType=='component' && (settings?.footer?.container?.component?.class || 'content-post-width | py-4')) ||
      (pageType=='post' && (settings?.footer?.container?.post?.class || 'content-post-width | py-4'))
    }
    {settings?.footer?.container?.sideBySide && 'footer-sidebyside notion-row-columnflex notion-sturdy-columnheaders'} 
    "
  >
    <!-- this is usually on the LEFT side of the Content Blocks / massive links list -->
    <!-- this is normally flush to the block containers; on xs, add padding to align to text -->
    <div class="Component-Footer-Content-Container | {settings?.footer?.contentContainer?.class||'pfix pl-2 md:pl-0'} ">
      {#if content}
        <div class="Component-Footer-Content | {settings?.footer?.content?.class||'my-2'}">
          {@html marked(content)}
        </div>
      {/if}

      {#if socialLinks}
        <div class="Component-Footer-Social | {settings?.footer?.social?.class||'text-2xl | mb-2'} ">
          <SocialBox {email} socialText={socialLinks} />
        </div>
      {/if}
    </div>

    <!-- usually rendered as a massive links list -->
    {#if pageBlocks }
      <div class="Component-Footer-Blocks  {settings?.footer?.blocks?.class||''}">
        <Notion blocks={pageBlocks} />
      </div>
    {/if}
  </div>

  {#if settings?.footer?.bottom}
    <div class="Component-Footer-Bottom | {settings?.footer?.bottom?.container?.class||'content-notion-wide | p-4 | flex flex-row gap-2'}">
      <div class="Component-Footer-Bottom-Left {settings?.footer?.bottom?.left?.class||'grow'}">
        {@html marked(settings?.footer?.bottom?.left?.markdown||'')}
      </div>
      <div class="Component-Footer-Bottom-Right {settings?.footer?.bottom?.right?.class||'self-end'}">
        {@html marked(settings?.footer?.bottom?.right?.markdown||'')}
      </div>
    </div>
  {/if}
</footer>

<div class="Content-Blogalog | text-sm py-4 text-center mt-2 bg-slate-50">
  Get your <a href="https://blogalog.net"> very own website for your blog, CV, lab, or project.</a>
</div>


<style lang="scss" global>

  .footer-sidebyside {
    // apply to Component-Footer
    @apply md:flex gap-24;

    .Component-Footer-Content-Container {
      @apply grow;
    }
    .Component-Footer-Blocks {
      // @apply flex-1;
      @apply mt-8 md:mt-0;
    }
    .notion {
      .notion-column {
        @apply pt-0;
      }
      p {
        @apply pb-3;
      }
      .notion-link {
        a {
          @apply subpixel-antialiased;
        }
        // @apply break-words;
        // word-break: normal;
      }
    }
  }

</style>
