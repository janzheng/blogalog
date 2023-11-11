<script >
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  import { page } from '$app/stores';
  export let data = $page.data, cta="Submit", showDebug = false, classes="radius-xs border-red-10 bg-slate-50";
  export let formData;

  export let onUpdated, onSubmit, onError, message

  // Client API:
  export const { form, enhance, errors, constraints } = superForm(data.form, {
    onSubmit,
    onUpdated,
    onError
  });

  $: if($page.form) {
    formData = $page.form
  }


</script>

<div class="{classes}">
  <form method="POST" action="/api/actions/?/email" use:enhance >
    <label for="email">Email</label>
    <input
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
