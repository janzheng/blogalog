
<!-- 

  DEPRECATED — use GRID INSTEAD


 -->
{#if isLoading}
  <h2 style="padding-top:0"><Loader /> Loading Member ...</h2>
{:else}
  {#if member}
    <div class="Member | p-4 bg-slate-50 |">
      {#if member.Photo}
        <div class="Member-Photo | mb-2">
          <img class="rounded-full w-24 h-24" src={getNotionImageLink(member.Photo)} alt="{member.Name} Profile" />
        </div>
      {/if}
      <div class="Member-Name">{member.Name}</div>
      <div class="Member-Affiliation | text-sm">{member.Affiliation||''}</div>
      <div class="Member-ShortBio | text-sm">{member['Short']||''}</div>
      <div class="Member-Story whitespace-pre-line mt-4">{@html member['Story']||'No story provided'}</div>
    </div>
  {:else}
    <h2>No member found at "{slug}"</h2>
  {/if}
{/if}



<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { fetchPost } from "$plasmid/utils/fetch-helpers"
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  import { getNotionImageLink } from '$lib/helpers.js'

  export let id, member={}, settings, isLoading, slug;


  const loadData = async (id, settings) => {
    if(!id) throw new Error("No database ID provided")

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
    let results = await loadData(id, settings)
    member = results?.[0]
    // console.log('-----> member:', member, results)
  });

</script>