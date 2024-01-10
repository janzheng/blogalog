<script>
  import { twMerge } from 'tailwind-merge'
  import { generatePageStyles } from '$lib/helpers.js'
  import Hamburger from '$lib/components/Hamburger.svelte'

  import { getContext } from 'svelte';
  let blogData = getContext('blogData');


	import { slide } from 'svelte/transition';
  let isOpen = false;

  let menuStyles = blogData?.menu?.page && generatePageStyles(blogData?.menu?.page);
</script>




{#if blogData?.menu}
  <div class="Menu-container | {blogData?.menu?.container?.class || ''} "
  >
    {#if blogData?.menu?.desktop?.show}
      <div 
        class="Menu-desktop hidden {blogData?.menu?.desktop?.class || 'content-notion-wide | mb-2 px-4 | md:flex items-center gap-4'} "
        style="{blogData?.menu?.desktop?.page && generatePageStyles(blogData?.menu?.desktop?.page, {type: 'string'}) || ''}; {blogData?.menu?.desktop?.styles||''}"
        >
        {#if blogData?.menu?.desktop?.icon}
          <div class="Menu-Icon | {blogData?.menu?.desktop?.icon?.class || ''}">
            <img class="{blogData?.menu?.desktop?.icon?.img?.class || ''}" src={blogData?.menu?.desktop?.icon?.src} alt={blogData?.menu?.desktop?.icon?.alt} />
          </div>
        {/if}
        {#if blogData?.menu?.desktop?.text}
          <div class="Menu-Text | {blogData?.menu?.desktop?.text?.class || ''}">
            {blogData?.menu?.desktop?.text?.content}
          </div>
        {/if}
        <div class="Menu-Links | {blogData?.menu?.links?.class || 'grow flex gap-6 items-center justify-end' }">
          {#each blogData?.menu?.desktop?.links?.items as link}
            <a class="Menu-Link { twMerge(blogData?.menu?.desktop?.link?.class || '', link?.class || '')} " href="{link.link}">{link.text}</a>
          {/each}
        </div>
      </div>
    {/if}




    {#if blogData?.menu?.mobile?.show}
      <div class="Menu-Mobile | {blogData?.menu.mobile?.class || 'md:hidden'}"
        style="{blogData?.menu?.mobile?.page && generatePageStyles(blogData?.menu?.mobile?.page, {type: 'string'}) || ''}; {blogData?.menu?.mobile?.styles||''}"
      >
        <div class="Menu-Mobile--Top {blogData?.menu.mobile?.top?.class || 'flex gap-4 items-center'} ">
          {#if blogData?.menu?.mobile?.icon}
            <div class="Menu-Icon | {blogData?.menu?.mobile?.icon?.class || ''}">
              <img class="{blogData?.menu?.mobile?.icon?.img?.class || ''}" src={blogData?.menu?.mobile?.icon?.src} alt={blogData?.menu?.mobile?.icon?.alt} />
            </div>
          {/if}
          {#if blogData?.menu?.mobile?.text}
            <div class="Menu-Text | {blogData?.menu?.mobile?.text?.class || ''}">
              {blogData?.menu?.mobile?.text?.content}
            </div>
          {/if}
          {#if blogData?.menu?.mobile?.hamburger}
            <div class="Menu-Mobile--hamburger | {blogData?.menu?.mobile?.hamburger?.class || 'grow text-right'}">
              <Hamburger bind:open={isOpen} />
            </div>
            <!-- <button class="Menu-mobile--button {blogData?.menu.mobile?.button?.class || 'Btn-outline m-2 p-2'}" on:click={() => showMenu = !showMenu}>
              {blogData?.menu.mobile?.button?.content || 'Menu'}
            </button> -->
            {:else}
            <button class="Menu-Mobile--button {blogData?.menu.mobile?.button?.class || 'Btn-outline m-2 p-2'}" on:click={() => isOpen = !isOpen}>
              {#if !isOpen}
                {blogData?.menu.mobile?.button?.content.open || blogData?.menu.mobile?.button?.content || 'Open Menu'}
              {:else}
                {blogData?.menu.mobile?.button?.content.close || blogData?.menu.mobile?.button?.content || 'Close Menu'}
              {/if}
            </button>
          {/if}
        </div>

        {#if isOpen}
          <!-- <div transition:slide="{{duration: blogData?.menu.mobile?.transition || 300}}" class="Menu-mobile--links { blogData?.menu.mobile?.button?.class || 'absolute right-0 w-56 mt-2 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'}"> -->
          <div transition:slide="{{delay: blogData?.menu.mobile?.delay || 0, duration: blogData?.menu.mobile?.duration || 400, axis: blogData?.menu.mobile?.axis || 'y' }}" class="Menu-Mobile--links { blogData?.menu.mobile?.button?.class || 'absolute px-4 pb-2 -ml-2 -mr-4 w-full mt-2 bg-white divide-y divide-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'}">
            {#each blogData?.menu?.mobile?.links?.items as link}
              <a href="{link.link}" class="Menu-Mobile--link { twMerge(blogData?.menu?.mobile?.link?.class || 'text-center | block px-4 py-4 text-lg text-slate-700 hover:bg-gray-100', link?.class || '')} ">{link.text}</a>
            {/each}
          </div>
        {/if}
      </div>
    {/if}


  </div>
{/if}


