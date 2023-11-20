
{#if key === 'id' || key === 'format' || key === 'Show' || key === 'Hide'}
  <!-- do nothing for ids -->
{:else}
  <!-- if schema is provided, ONLY show what's on the schema? -->
  {#if schema?.[key]}
    <!-- key:{key} | {item[key]} | {schema?.[key]?.type} | {schema?.[key]?.class} -->
    {#if schema?.[key]?.type === 'image' && item[key]?.[0]?.rawUrl || item[key]?.[0]?.url}
      <div class="Item-type-image Item-{key} | mb-1">
        <img class="{schema?.[key]?.class || 'rounded-full w-24 h-24 bg-slate-100'}" src={getNotionImageLink(item[key]?.[0])} alt="{item?.[itemKey]}" />
      </div>
    {:else if schema?.[key]?.type === 'html'}
      <div class="Item-type-html Item-{key} | mb-1 {schema?.[key]?.class||''}">{@html item[key]||''}</div>
    {:else if schema?.[key]?.type === 'link'}
      <div class="Item-link Item-{key} | mb-1 {schema?.[key]?.class||''}">
        {#if schema?.[key]?.onlyShowOrigin}
          <a class="Item-link-href--origin" href="{item[key]}">{item[key]?.split('/')[2]}</a>
        {:else}
          <a class="Item-link-href" href="{item[key]}">{item[key]}</a>
        {/if}
      </div>
    {:else if schema?.[key]?.type === 'tag'}
      <div class="Item-type-tag Item-{key} | mb-1 {schema?.[key]?.class||''}">
        <span class="{schema?.[key]?.tagClass ||  'bg-zinc-100 text-xs rounded-md text-slate-800 px-2 py-1 mr-1 mb-1'}">{item[key]}</span>
      </div>
    {:else if schema?.[key]?.type === 'tagText'}
      <div class="Item-type-tagText Item-{key} | mb-1 {schema?.[key]?.class||''}">
        <!-- {#each item[key]?.split(',').map(tag => tag.trim()) as tag}
          <span class="{schema?.[key]?.tagClass ||  'bg-slate-100 text-xs rounded-md text-slate-800 px-2 py-1 mr-1 mb-1'}">{tag}</span>
        {/each} -->
      </div>
    {:else if schema?.[key]?.type === 'markdown'}
      <!-- <div class="Item-type-markdown pfix Item-{key} | {schema?.[key]?.class||''}">{@html marked(item[key]||'')}</div> -->
  <div class="Item-type-markdown pfix Item-{key} | {schema?.[key]?.class||''}">{@html marked(fixMarkdownLinks(item[key]||''))}</div>
    {:else}
      <div class="Item-type-default Item-{key} | {schema?.[key]?.class||''}">{item[key]||''}</div>
    {/if}
  {/if}
{/if}




<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { marked } from 'marked';
  import YAML from 'yaml'
  import { getNotionImageLink } from '$lib/helpers.js'
  import { fetchPost } from "$plasmid/utils/fetch-helpers";
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';

  export let item, key, schema, itemKey="Name";

  // fixes Markdown in Notion which auto-converts links to embedded links
  function fixMarkdownLinks(md) {
    const regex = /\[(.*?)\]\s*\(<a class="notion-link" href="(.*?)"\>(.*?)<\/a>\)/g;
    let result = md.replace(regex, '[$1]($2)');

    // console.log('result:', result)
    return result
  }

</script>