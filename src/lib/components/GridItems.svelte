<!-- 

  Based off of Itemlist
  - more generalized

 -->


<!-- {#await getItems(id) then Items} -->
{#if isLoading || !items || !settings}
  <h2 style="padding-top:0"><Loader /> Loading Items</h2>
{:else}
  {#if items && settings}
    <div class="Items | {settings?.items.class || 'grid grid-cols-2 gap-4'}">
      {#each items as item}
        <div class="Item | p-4 bg-slate-50 {settings?.item.class} | {settings?.modal ? 'cursor-pointer' : ''}"
          on:click={()=>browser && settings.modal && getModal(item.Name).open()} 
          on:keyup={()=>browser && settings.modal && getModal(item.Name).open()}
          >
          {#each Object.keys(item) as key}
            {#if key === 'id'}<!-- do nothing for ids -->
            {:else}
              {#if settings?.schema?.[key]?.type === 'image'}
                <div class="Item-{key} | mb-2">
                  <img class="{settings?.schema?.[key]?.class||'rounded-full w-24 h-24'}" src={item[key]} alt="{item.Name}" />
                </div>
              {:else if settings?.schema?.[key]?.type === 'html'}
                <div class="Item-{key} | flex content-center {settings?.schema?.[key]?.class||'text-sm'}">{@html item[key]||''}</div>
              {:else}
                <div class="Item-{key} | {settings?.schema?.[key]?.class||'text-sm'}">{item[key]||''}</div>
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
  import { fetchPost } from "$plasmid/utils/fetch-helpers"
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
    return result
	};

  $: if(!settings) {
    (async ()=> {
      ({items, settings} = await getItems(id, settings))
    })()
  }

  onMount(async () => {
    ({items, settings} = await getItems(id, settings))
    console.log('Items + Settings:::', items, settings)
  });

</script>