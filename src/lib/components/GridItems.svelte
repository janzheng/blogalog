<!-- 

  Based off of Itemlist
  - more generalized

 -->


<!-- {#await getItems(id) then Items} -->
{#if isLoading || !items || !settings}
  <h2 style="padding-top:0"><Loader /> Loading Items</h2>
{:else}
  {#if items && settings}
    <div class="Items | {settings?.items?.class || 'grid grid-cols-1 md:grid-cols-2 gap-4'}">
      {#each items as item}
        <div class="Item | p-4 bg-slate-50 {settings?.item?.class} | {settings?.modal ? 'cursor-pointer' : ''}"
          on:click={()=>browser && settings.modal && getModal(item?.Name).open()} 
          on:keyup={()=>browser && settings.modal && getModal(item?.Name).open()}
          >
          {#each getOrderedKeys(item) as key}
            {#if key === 'id' || key === 'format'}
              <!-- do nothing for ids -->
            {:else}
              {#if settings?.schema?.[key]?.type === 'image' && item[key]?.[0]?.rawUrl || item[key]?.[0]?.url}
                <div class="Item-{key} | mb-2">
                  <img class="bg-slate-100 {settings?.schema?.[key]?.class || 'rounded-full w-24 h-24'}" src={getNotionImageLink(item[key]?.[0])} alt="{item?.Name}" />
                </div>
              {:else if settings?.schema?.[key]?.type === 'html'}
                <div class="Item-{key} | mb-2 {settings?.schema?.[key]?.class||'text-sm'}">{@html item[key]||''}</div>
              {:else if settings?.schema?.[key]?.type === 'link'}
                <div class="Item-{key} | mb-2 {settings?.schema?.[key]?.class||'text-sm'}">
                  <a href="{item[key]}">{item[key]}</a>
                </div>
              {:else if settings?.schema?.[key]?.type === 'markdown'}
                <div class="Item-{key} | mb-2 {settings?.schema?.[key]?.class||'text-sm'}">{@html marked(item[key]||'')}</div>
              {:else}
                <div class="Item-{key} | mb-2 {settings?.schema?.[key]?.class||'text-sm'}">{item[key]||''}</div>
              {/if}
            {/if}
          {/each}

          <!-- <button on:click={()=>browser && getModal(Item.Name).open()}>
            Open {Item.Name}
          </button> -->
          <!-- {#if browser && settings.modal}
            <Modal id={item.Name}>
              {#if item.Photo}
                <div class="Item-Photo | mb-2">
                  <img class="rounded-full w-24 h-24" src={item.Photo} alt="{item.Name} Profile" />
                </div>
              {/if}
              <div class="Item-Name"><h2 class="pt-0">{item.Name}</h2></div>
              <div class="Item-Affiliation">{item.Affiliation||''}</div>
              <div class="Item-ShortBio">{item['Short']||''}</div>
              <div class="Item-Story whitespace-pre-line mt-4">{@html item['Story']||'No story provided'}</div>
            </Modal>
          {/if} -->

        </div>
      {/each}
    </div>
  {/if}
{/if}
<!-- {/await} -->
 


<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { marked } from 'marked';
  import { getNotionImageLink } from '$lib/helpers.js'
  import { fetchPost } from "$plasmid/utils/fetch-helpers";
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';

  export let id, items, settings, isLoading;

  const getItems = async (id) => {
    isLoading = true
    let url = `/api/gridItems/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings}, fetch)
			if(response.ok) {
        result = await response.json()
			}
		} catch(err) {
      console.error('getItems', err)
    }
    isLoading = false
    let items = [...result.items]

    return {
      items: items,
      settings: result.settings || {}
    }
	};

  $: if(!settings) {
    (async ()=> {
      ({items, settings} = await getItems(id, settings))
    })()
  }

  onMount(async () => {
    ({items, settings} = await getItems(id, settings))
  });

  function getOrderedKeys (items) {
    const keys = Object.keys(items);
    if(settings?.order) {
      return [
        ...settings.order.filter(key => keys.includes(key)), // ordered keys
        ...keys.filter(key => !settings.order.includes(key)) // remaining keys
      ];
    }
    return keys;
  }
</script>