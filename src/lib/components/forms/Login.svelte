<script >
  import YAML from 'yaml'
  import { parseYaml } from '$lib/helpers.js';
  import { userData } from '$lib/stores.js';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  import { page } from '$app/stores';
  export let data = $page.data, showDebug = false, classes="radius-xs border-red-10 bg-slate-50";
  export let formData = {}; // used in bind; don't erase!
  export let cta="Log in", loading="Logging in...", success="Logged in!";

  export let message=null, row=null

  let settings;
  if(row.YAML) {
    settings = parseYaml(row.YAML)
    loading = settings?.form?.messages?.loading || loading;
    success = settings?.form?.messages?.success || success;
    cta = settings?.form?.messages?.cta || cta;
  }


  // Client API:
  export const { form, enhance, errors, constraints } = superForm(data.form, {
    onError: ({ result }) => {
      message = result.error.message;
    },
    onUpdated: ({ form, user }) => {
      if (form.valid) {
        if(form.data.Email) {
          // $userData['Email'] = form.data.email;
          $userData = formData.user;
          message = success;
        }
      } else {
        message = form.message;
      }
    },
    onSubmit: ({ action, formData, formElement, controller, submitter, cancel }) => {
      formData.set('hostname', $page.data.hostname); // sends data to right place
      formData.set('notion', row.Content); // use page.Content as the notionId
      // console.log('----submitting:', row.Content, $page, Object.fromEntries(formData.entries()))
      message = loading;
    }
  });

  $: if($page.form) {
    formData = $page.form
  }


</script>

<div class="Component-Login-Form {classes}">
  <form method="POST" action="/api/actions/?/login" use:enhance >
    <label for="email">Email</label>
    <input
      class="py-2 px-4"
      type="email"
      name="Email"
      placeholder="jane@example.com"
      aria-invalid={$errors.Email ? 'true' : undefined}
      bind:value={$form.Email}
      {...$constraints.Email} />

    {#if $errors.Email}<span class="invalid">{$errors.Email}</span>{/if}

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
