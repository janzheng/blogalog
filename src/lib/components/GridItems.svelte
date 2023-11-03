<!-- 

  Based off of Itemlist
  - more generalized

 -->


<!-- {#await getItems(id) then Items} -->
{#if isLoading}
  <h2 style="padding-top:0"><Loader /> Loading Items</h2>
{:else}
  {#if items}
    <div class="Items | grid grid-cols-2 gap-4">
      {#each items as item}
        <div class="Item | p-4 bg-slate-50 | cursor-pointer"
          on:click={()=>browser && getModal(item.Name).open()} 
          on:keyup={()=>browser && getModal(item.Name).open()}
          >
          {#if item.Photo}
            <div class="Item-Photo | mb-2">
              <img class="rounded-full w-24 h-24" src={item.Photo} alt="{item.Name} Profile" />
            </div>
          {/if}
          <div class="Item-Name">{item.Name}</div>
          <div class="Item-Affiliation | text-sm">{item.Affiliation||''}</div>
          <div class="Item-ShortBio | text-sm">{item['Short']||''}</div>
          <!-- <button on:click={()=>browser && getModal(Item.Name).open()}>
            Open {Item.Name}
          </button> -->
          <!-- {#if browser}
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
  
  console.log('Items:::', items)

  const getItems = async (id) => {
    isLoading = true
    let url = `/api/gridItems/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings}, fetch)
			if(response.ok) {
        result = await response.json()
        result = result.items
			}
		} catch(err) {
      console.error('getItems', err)
    }
    isLoading = false
    return result
	};

  onMount(async () => {
    items = await getItems(id, settings)
  });

</script>