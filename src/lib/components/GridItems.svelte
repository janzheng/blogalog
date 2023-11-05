<!-- 

  Based off of Itemlist
  - more generalized

 -->


<!-- {#await getItems(id) then Items} -->
{#if isLoading || !items || !settings}
  <h2 style="padding-top:0"><Loader /> {settings?.loading || "Loading"}</h2>
{:else}
  {#if items && settings}
    <!-- <div class="Items | " style="{twi(settings?.items?.class || 'grid grid-cols-2 md:grid-cols-2 gap-4')}"> -->
    <div class="Items | {settings?.items?.class || 'grid grid-cols-1 md:grid-cols-2 gap-4'}">
      {#each items as item}
        <div class="Item | p-4 bg-slate-50 {settings?.item?.class} | {settings?.modal ? 'cursor-pointer' : ''}"
          on:click={()=>handleOpenModal(item)} 
          on:keyup={()=>handleOpenModal(item)}
          >
          {#each getOrderedKeys(item) as key}
            <GridItemRow {item} {key} schema={settings?.schema} />
          {/each}
          <!-- <button on:click={()=>browser && getModal(Item.Name).open()}>
            Open {Item.Name}
          </button> -->

          {#if browser && settings.modal}
            <!-- pageblocks are only opened on modal, to prevent loading too many pages -->
            <Modal id={item.Name}>
              {#each getOrderedKeys(item, settings?.modal?.order||[]) as key}
                <GridItemRow {item} {key} schema={settings?.modal?.schema} />
              {/each}
              {#if settings.modal.loadNotionPage && pageBlocks}
                <Notion blocks={pageBlocks} />
              {/if}
            </Modal>
          {/if}

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
  import YAML from 'yaml'
  import { getNotionImageLink } from '$lib/helpers.js'
  import Notion from '@yawnxyz/sveltekit-notion';
  import { fetchPost } from "$plasmid/utils/fetch-helpers";
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import GridItemRow from '$lib/components/GridItemRow.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  import { twi } from "tw-to-css";

  export let id, items, settings, isLoading, pageBlocks;


  if(settings) {
    settings = YAML.parse(settings)
  }
   
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
      console.error('[getItems] error', err)
    }
    isLoading = false
    let items = [...result.items]

    return {
      items: items,
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

  async function handleOpenModal (item) {
    if(browser && settings.modal) {
      if(!pageBlocks && (settings.loadNotionPage || settings.modal.loadNotionPage)) {
        pageBlocks = await loadPage(item.id);
      }

      getModal(item.Name).open()
    }
  }

  
</script>