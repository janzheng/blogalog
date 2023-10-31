
<script>
	import { page } from '$app/stores';
  import { marked } from "marked";
	// import logo from './svelte-logo.svg';

  export const logo = '/icon.png';
  export let content;

  export let clientHeight;
</script>

<footer bind:clientHeight={clientHeight} class="Footer | mt-4 | content-pad | bg-slate-50 ">
  {#if content}
    <div class="Content pfix text-center">
      {@html marked(content)}
    </div>
  {:else}
    <div class=" ">
      <div class="">
        <span class="inline mx-2"><a class="_margin-right" href="https://github.com/janzheng">Github</a></span>
        <span class="inline mx-2"><a class="_margin-right" href="https://www.linkedin.com/in/janzh/">Linkedin</a></span>
        <span class="inline mx-2"><a class="_margin-right" href="https://twitter.com/yawnxyz">@yawnxyz</a></span>
        <span class="inline mx-2"><a class="_margin-right" href="/resume.pdf">resume</a></span>
        <span class="inline mx-2"><a class="_block-xs _padding-top-xs" href="mailto:hello@janzheng.com">hello@janzheng.com</a></span>
      </div>
    </div>
  {/if}
</footer>

