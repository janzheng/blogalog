
{#if key === 'id' || key === 'format' || key === 'Show' || key === 'Hide'}
  <!-- do nothing for ids -->
{:else}
  <!-- if schema is provided, ONLY show what's on the schema? -->
  {#if schema?.[key]}
    <!-- key:{key} | {item[key]} | {schema?.[key]?.type} | {schema?.[key]?.class} -->
    {#if schema?.[key]?.type === 'image' && item[key]?.[0]?.rawUrl || item[key]?.[0]?.url}
      <div class="Item-type-image Item-{key} | {schema?.[key]?.classContainer || 'mb-1'}" style={schema?.[key]?.style||''}>
        <img class="{schema?.[key]?.class || 'rounded-full w-24 h-24 bg-slate-100'}" src={getNotionImageLink(item[key]?.[0])} alt="{item?.[itemKey]}" />
      </div>
    {:else if schema?.[key]?.type === 'html'}
      <div class="Item-type-html Item-{key} | mb-1 {schema?.[key]?.class||''}" style={schema?.[key]?.style||''}>{@html item[key]||''}</div>
    {:else if schema?.[key]?.type === 'createdBy' || schema?.[key]?.type === 'lastEditedBy'}
      {#if item[key] && item[key].length > 0}
        {#each item[key] as user}
          <div class="Item-byline Item-{key} | mt-2 mb-2 {schema?.[key]?.classContainer||''}" >
            {#if user?.profilePhoto}
              <img class="Item-byline-profilePhoto mr-2 inline-block | {schema?.[key]?.class||'rounded-full w-8 h-8'} " src={getNotionImageLink(user?.profilePhoto)} alt="{user?.fullName}" />
            {/if}
            <span lcass="Item-byline-fullName">{user?.fullName}</span>
          </div>
        {/each}
      {/if}
    {:else if schema?.[key]?.type === 'link'}
      <div class="Item-link Item-{key} |  mb-1 {schema?.[key]?.class||''}" style={schema?.[key]?.style||''}>
        {#if schema?.[key]?.onlyShowOrigin}
          <a class="Item-link-href--origin" href="{item[key]}">{item[key]?.split('/')[2]}</a>
        {:else}
          <a class="Item-link-href" href="{item[key]}">{item[key]}</a>
        {/if}
      </div>
    {:else if schema?.[key]?.type === 'tag' || schema?.[key]?.type === 'tags'}
      {#if typeof item[key] === 'string'}
        <!-- single tag; select -->
        <div class="Item-type-tag Item-{key} | mb-1 {schema?.[key]?.class||''}" style={schema?.[key]?.style||''}>
          <span class="{schema?.[key]?.tagClass || 'bg-zinc-200/50 text-xs rounded-md text-slate-800 px-2 py-1 mr-1 mb-1'}">{item[key]}</span>
        </div>
      {:else if Array.isArray(item[key])}
        <div class="Item-type-tag tag-array Item-{key} | mb-1 {schema?.[key]?.class||''}" style={schema?.[key]?.style||''}>
          {#each item[key].map(tag => tag.trim()) as tag}
            <span class="{schema?.[key]?.tagClass ||  'bg-zinc-200/50 text-xs rounded-md text-slate-800 px-2 py-1 mr-1 mb-1'}">{tag}</span>
          {/each}
        </div>
      {/if}
    {:else if schema?.[key]?.type === 'markdown'}
      <!-- <div class="Item-type-markdown pfix Item-{key} | {schema?.[key]?.class||''}">{@html marked(item[key]||'')}</div> -->
      <!-- <div class="Item-type-markdown pfix Item-{key} | mb-1 {schema?.[key]?.class||''}">{@html marked(fixMarkdownLinks(item[key]||''))}</div> -->
      <div class="Item-type-markdown pfix Item-{key} | mb-1 {schema?.[key]?.class||''}" style={schema?.[key]?.style||''}>
        {@html md.render(fixMarkdownLinks(item[key]||''))}
      </div>
    {:else}
      <div class="Item-type-default Item-{key} | {schema?.[key]?.class||''}" style={schema?.[key]?.style||''}>{@html item[key]}</div>
    {/if}
  {/if}
{/if}




<script>
  // import { onMount } from 'svelte';
  // import { browser } from '$app/environment';
  import { marked } from 'marked';
  // import YAML from 'yaml'
  import { getNotionImageLink } from '$lib/helpers.js'
  // import { md } from "$plasmid/utils/markdownit/strip.js";
  // import { fetchPost } from "$plasmid/utils/fetch-helpers";
  // import Modal, {getModal} from '$lib/components/Modal.svelte';
  // import Loader from '$plasmid/components/icons/loader.svelte';


  marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
  });


  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt({ breaks: true, html: true });
  md.use(markdownItAttrs);

  export let item, key, schema, itemKey="Name";

  // fixes Markdown in Notion which auto-converts links to embedded links
  function fixMarkdownLinks(md) {
    // const regex = /\[(.*?)\]\s*\(<a class="notion-link" href="(.*?)"\>(.*?)<\/a>\)/g;
    // let result = md.replace(regex, '[$1]($2)');

    // console.log('result:', result)
    const regex = /\[(.*?)\]\s*\(<a class="notion-link" href="(.*?)"\>(.*?)<\/a>\)/g;
    let result = md.replace(regex, '[$1]($2)');
    const stripTagsRegex = /<a.*?href="(.*?)".*?>(.*?)<\/a>/g;
    result = result.replace(stripTagsRegex, '[$2]($1)');
    // console.log('result:', result);
    
    return result
  }

</script>