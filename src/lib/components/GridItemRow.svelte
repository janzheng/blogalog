
{#if key === 'id' || key === 'format' || key === 'Show' || key === 'Hide'}
  <!-- do nothing for ids -->
{:else}
  <!-- key:{key} | {item[key]} | {schema?.[key]?.type} | {schema?.[key]?.class} -->
  {#if schema?.[key]?.type === 'image' && item[key]?.[0]?.rawUrl || item[key]?.[0]?.url}
    <div class="Item-{key} | mb-2">
      <img class="bg-slate-100 {schema?.[key]?.class || 'rounded-full w-24 h-24'}" src={getNotionImageLink(item[key]?.[0])} alt="{item?.Name}" />
    </div>
  {:else if schema?.[key]?.type === 'html'}
    <div class="Item-{key} | mb-2 {schema?.[key]?.class||''}">{@html item[key]||''}</div>
  {:else if schema?.[key]?.type === 'link'}
    <div class="Item-{key} | mb-2 {schema?.[key]?.class||''}">
      <a href="{item[key]}">{item[key]}</a>
    </div>
  {:else if schema?.[key]?.type === 'markdown'}
    <div class="Item-{key} | mb-2 {schema?.[key]?.class||''}">{@html marked(item[key]||'')}</div>
  {:else}
    <div class="Item-{key} | mb-2 {schema?.[key]?.class||''}">{item[key]||''}</div>
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

  export let item, key, schema;

</script>