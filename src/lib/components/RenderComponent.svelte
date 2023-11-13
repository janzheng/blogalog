

<script>
  import Notion from '@yawnxyz/sveltekit-notion';

  import { userData } from '$lib/stores.js'

  import Email from '$lib/components/forms/Email.svelte';
  import GridItems from '$lib/components/GridItems.svelte';
  import Expander from '$lib/components/Expander.svelte';
  // import MemberList from '$lib/components/MemberList.svelte';
	// import SocialBox from '$plasmid/components/SocialBox2.svelte'


  export let page;
  export let emailForm, unlockMessage;

</script>








<div class="RenderComponent">
  
  {#if page.Type.includes("Private") && !$userData['Email']}
    <!-- do nothing -->
  {:else if page.Type.includes("Public") && $userData['Email']}
    <!-- do nothing -->
  {:else}
    {#if page.Name == "Unlock"}
      <div class="Component-Unlock | p-4 bg-slate-50 ">
        <Notion blocks={page.pageBlocks} />
        {#if $userData['Email']}
          <div class="Component-Unlock-Status">
            Logged in as {$userData['Email']}. <button on:click={()=>{
              $userData['Email'] = null;
            }} class="Btn-link --short">Log out</button>
          </div>
          <div class="Component-Unlock-Details">
            {#if $userData['Payments']}
              ✅ All Paid! Receipt: <span class="text-slate-400">{$userData['Payments']}</span>
            {/if}
          </div>
        {:else}
          <Email cta="Log in" message={unlockMessage}
            bind:formData={emailForm}
            onError={({ result }) => {
              unlockMessage = result.error.message;
            }}
            onUpdated={({ form, user, banana }) => {
              if (form.valid) {
                if(form.data.email) {
                  // $userData['Email'] = form.data.email;
                  $userData = emailForm.user;
                  unlockMessage = "Success!";
                }
              } else {
                unlockMessage = "Email doesn‘t exist";
              }
            }}
            onSubmit={({ action, formData, formElement, controller, submitter, cancel }) => {
              formData.set('notion', page.Content); // use page.Content as the notionId
              unlockMessage = "Logging in...";
            }} 
          />
        {/if}
      </div>
    {:else if page.Name == "Members"}
      <div class="Component-Members | p-4 bg-slate-50 ">
        <!-- deprecated -->
        <!-- <Notion blocks={page.pageBlocks} /> -->
        <!-- <MemberList id={page.Content} settings={page.YAML} /> -->
      </div>
    {:else if page.Name == "Grid"}
      <div class="Component-Grid | p-4 bg-slate-50 ">
        <Notion blocks={page.pageBlocks} />
        <div class="GridItems | mt-2">
          <GridItems id={page.Content} settings={page.YAML} />
        </div>
      </div>
    {:else if page.Name == "Expander"}
      <div class="Component-Expander | p-4 bg-slate-50 ">
        <Expander {page} />
      </div>
    {:else if page.Name == "HTML"}
      <div class="Component-HTML | p-4 bg-slate-50 ">
        {@html page.Content}
      </div>
    {/if}
  {/if}



</div>