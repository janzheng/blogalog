<script >
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import { userData } from '$lib/stores.js'

  import { page } from '$app/stores';
  export let data = $page.data, cta="Submit", showDebug = false, classes="radius-xs border-red-10 bg-slate-50";
  // export let formData;

  export let message

  // Client API:
  export const { form, enhance, errors, constraints } = superForm(data.form, {
    onError: ({ result }) => {
      unlockMessage = result.error.message;
    },
    onUpdated: ({ form, user }) => {
      if (form.valid) {
        if(form.data.email) {
          // $userData['Email'] = form.data.email;
          $userData = loginForm.user;
          unlockMessage = "Success!";
        }
      } else {
        unlockMessage = "Email doesn‘t exist";
      }
    },
    onSubmit: ({ action, formData, formElement, controller, submitter, cancel }) => {
      formData.set('notion', page.Content); // use page.Content as the notionId
      unlockMessage = "Logging in...";
    }
  });

  // $: if($page.form) {
  //   formData = $page.form
  //   console.log('page form>???', formData)
  // }


</script>

<div class="{classes}">
  <form method="POST" action="/api/actions/?/login" use:enhance >
    <label for="email">Email</label>
    <input
      class="py-2 px-4"
      type="email"
      name="email"
      placeholder="jane@example.com"
      aria-invalid={$errors.email ? 'true' : undefined}
      bind:value={$form.email}
      {...$constraints.email} />
      
    {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

    <div>
      <button class="Btn-outline mt-2">{cta}</button>
      {#if message}
        <span class="pl-2">{message}</span>
      {/if}
    </div>
  </form>

  {#if showDebug}
    <div class="Debug mt-2">
      <SuperDebug data={$form} />
    </div>
  {/if}
</div>



<style>
  .invalid {
    color: red;
  }
</style>
