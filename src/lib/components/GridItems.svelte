<!-- 

  Based off of Itemlist
  - more generalized

 -->

{#if (isLoading) || !items || !settings}
  <h2 style="padding-top:0"><Loader /> {settings?.loading || "Loading"}</h2>
{:else}
  {#if items && items.length > 0 && settings}
    <!-- <div class="Items | " style="{twi(settings?.items?.class || 'grid grid-cols-2 md:grid-cols-2 gap-4')}"> -->
    <div class="Items | {settings?.items?.class || 'grid grid-cols-1 md:grid-cols-2 gap-4'}">
      {#each items as item}
        <div class="Item | {settings?.item?.class || "p-4 bg-slate-50"} | {settings?.modal || settings?.item?.click ? 'cursor-pointer' : ''}"
          on:click={(e)=>handleItemClick(item, e)} 
          on:keyup={(e)=>handleItemClick(item, e)}
          >
          {#each getOrderedKeys(item) as key}
            <GridItemRow {item} {key} {itemKey} schema={settings?.schema} />
          {/each}
          <!-- <button on:click={()=>browser && getModal(Item[itemKey]).open()}>
            Open {Item[itemKey]}
          </button> -->

          {#if browser && settings.modal}
            <!-- pageblocks are only opened on modal, to prevent loading too many pages -->
            <Modal id={item[itemKey]}>
              {#each getOrderedKeys(item, settings?.modal?.order||[]) as key}
                <GridItemRow {item} {key} {itemKey} schema={settings?.modal?.schema} />
              {/each}
              {#if settings.modal.loadNotionPage && pageBlocks}
                <Notion blocks={pageBlocks} />
              {/if}
            </Modal>
          {/if}

        </div>
      {/each}
      {#if startCursor}
        <!-- notion loader feature -->
        <button class="Btn-outline" on:click={loadMoreItems} disabled={isLoadingMore}>
          {#if isLoadingMore}
            <Loader /> Loading...
          {:else}
            Load More
          {/if}
        </button>
      {/if}
    </div>
  {:else}
    <h2 style="padding-top:0">No items found</h2>
  {/if}
{/if}
 
 

<script>
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  import { marked } from 'marked';
  import YAML from 'yaml'
  import { getNotionImageLink } from '$lib/helpers.js'
  import Notion from '@yawnxyz/sveltekit-notion';
  import { fetchPost } from "$plasmid/utils/fetch-helpers";
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import GridItemRow from '$lib/components/GridItemRow.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  import { twi } from "tw-to-css";

  export let id, items=[], settings, isLoading, isLoadingMore, pageBlocks, startCursor;
  export let itemKey = 'Name';
  export let pageNumber = 1;


  if(settings) {
    settings = YAML.parse(settings)
    
    if(settings?.itemKey) {
      itemKey = settings.itemKey
      // defaults to "Name" as the main key, but can be re-specified with itemKey
    }
  }

  $: if (browser && settings && dev) {
    console.log('[dev] Grid settings:', settings)
  }
   

  async function loadMoreItems() {
    isLoadingMore = true;
    pageNumber++;
    await getItems(id);
    isLoadingMore = false;
  }
  
  const getItems = async (id) => {
    if(isLoadingMore != true)
      isLoading = true

    let url = `/api/gridItems/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings, pageNumber, startCursor}, fetch)
			if(response.ok) {
        result = await response.json()
			}
		} catch(err) {
      console.error('[getItems] error', err)
    }

    // for pagination w/ Notion
    if(result.startCursor)
      startCursor = result.startCursor

    items = [...items, ...result?.items]

    if(browser && dev)
      console.log('[dev][getItems] Items:', items)

    isLoading = false
    return {
      items: items || [],
    }
	};

  const loadPage = async (id) => {
    let url = `/api/loadPage/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings}, fetch)
			if(response.ok) {
        result = await response.json()
			}
		} catch(err) {
      console.error('[loadPage] error', err)
    }
    return result.pageBlocks
	};







  onMount(async () => {
    ({items} = await getItems(id, settings))
  });

  function getOrderedKeys (items, order=settings?.order) {
    const keys = Object.keys(items);
    if(order) {
      return [
        ...order.filter(key => keys.includes(key)), // ordered keys
        ...keys.filter(key => !order.includes(key)) // remaining keys
      ];
    }
    return keys;
  }

  async function handleItemClick (item, e) {
    if(browser && settings.modal) {
      if(!pageBlocks && (settings.loadNotionPage || settings.modal.loadNotionPage)) {
        pageBlocks = await loadPage(item.id);
      }

      getModal(item.Name).open()
    } else if (browser && settings.item?.click) {
      if(e) e.preventDefault();
      if(settings.item?.itemLink) {
        window.location.href = item[settings.item?.itemLink];
      }
    }
  }

</script>


<style lang="scss">
  .itemHover {
    @apply hover:bg-slate-100 rounded-md;
  }
</style>