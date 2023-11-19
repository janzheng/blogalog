
<script>

  import Icon from '@iconify/svelte';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'
	import { page } from '$app/stores';
  import { marked } from "marked";
	// import logo from './svelte-logo.svg';

  export const logo = '/icon.png';
  export let content;

  export let clientHeight;

  let blog = $page.data.blog;
  let email = blog?.['site-data']?.Email?.['Content'];
  let socialLinks = blog?.['site-data']?.SocialLinks?.['Content'];
</script>

<footer bind:clientHeight={clientHeight} class="Footer | mt-4 | content-pad | bg-slate-50 ">
  {#if content}
    <div class="Content pfix text-center">

      {#if socialLinks}
        <div class="text-2xl | mb-2">
          <SocialBox {email} socialText={socialLinks} />
        </div>
      {/if}
      
      <div class="Content-Custom | my-2">
        {@html marked(content)}
      </div>

      <div class="Content-Blogalog | text-center mt-2">
        Built with <a href="https://blogalog.net">Blogalog</a>
      </div>
    </div>
  <!-- don't default to Jan's stuff; show nothing if empty -->
  <!-- {:else}
    <div class=" ">
      <div class="">
        <span class="inline mx-2"><a class="_margin-right" href="https://github.com/janzheng">Github</a></span>
        <span class="inline mx-2"><a class="_margin-right" href="https://www.linkedin.com/in/janzh/">Linkedin</a></span>
        <span class="inline mx-2"><a class="_margin-right" href="https://twitter.com/yawnxyz">@yawnxyz</a></span>
        <span class="inline mx-2"><a class="_margin-right" href="/resume.pdf">resume</a></span>
        <span class="inline mx-2"><a class="_block-xs _padding-top-xs" href="mailto:hello@janzheng.com">hello@janzheng.com</a></span>
      </div>
    </div> -->
  {/if}
</footer>

