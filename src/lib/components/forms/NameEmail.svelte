<script >
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let data;

  // Client API:
  const { form, errors, constraints } = superForm(data.form);
</script>


<div class="_content">
  <div class="Card-light p-4">
    <form method="POST">
      <label for="name">Name</label>
      <input
        type="text"
        name="name"
        aria-invalid={$errors.name ? 'true' : undefined}
        bind:value={$form.name}
        {...$constraints.name} />
      {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

      <label for="email">E-mail</label>
      <input
        type="email"
        name="email"
        aria-invalid={$errors.email ? 'true' : undefined}
        bind:value={$form.email}
        {...$constraints.email} />
      {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

      <div><button class="Btn-outline mt-2">Submit</button></div>
    </form>

    <div class="Debug mt-2">
      <SuperDebug data={$form} />
    </div>
  </div>
</div>



<style>
  .invalid {
    color: red;
  }
</style>
