
<!-- {#await getMembers(id) then members} -->
{#if isLoading}
  <h2 style="padding-top:0"><Loader /> Loading members</h2>
{:else}
  {#if members}
    <div class="Members | grid grid-cols-2 gap-4">
      {#each members as member}
        <div class="Member | p-4 bg-slate-50 | cursor-pointer"
          on:click={()=>browser && getModal(member.Name).open()} 
          on:keyup={()=>browser && getModal(member.Name).open()}>
          {#if member.Photo}
            <div class="Member-Photo | mb-2">
              <img class="rounded-full w-24 h-24" src={member.Photo} alt="{member.Name} Profile" />
            </div>
          {/if}
          <div class="Member-Name">{member.Name}</div>
          <div class="Member-Affiliation | text-sm">{member.Affiliation||''}</div>
          <div class="Member-ShortBio | text-sm">{member['Short']||''}</div>
          <!-- <button on:click={()=>browser && getModal(member.Name).open()}>
            Open {member.Name}
          </button> -->
          {#if browser}
            <Modal id={member.Name}>
              {#if member.Photo}
                <div class="Member-Photo | mb-2">
                  <img class="rounded-full w-24 h-24" src={getNotionImageLink(member.Photo)} alt="{member.Name} Profile" />
                </div>
              {/if}
              <div class="Member-Name"><h2 class="pt-0">{member.Name}</h2></div>
              <div class="Member-Affiliation">{member.Affiliation||''}</div>
              <div class="Member-ShortBio">{member['Short']||''}</div>
              <div class="Member-Story whitespace-pre-line mt-4">{@html member['Story']||'No story provided'}</div>
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
  import { fetchPost } from "$plasmid/utils/fetch-helpers"
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  import { getNotionImageLink } from '$lib/helpers.js'

  export let id, members, settings, isLoading;
  
  const getMembers = async (id) => {
    isLoading = true
    let url = `/api/members/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings}, fetch)
			if(response.ok) {
        result = await response.json()
        result = result.members
			}
		} catch(err) {
      console.error('getMembers', err)
    }
    isLoading = false
    return result
	};

  onMount(async () => {
    members = await getMembers(id, settings)
    console.log('members:::', members)
  });

</script>