<script >
  import YAML from 'yaml'
  // import { userData } from '$lib/stores.js'
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  import TextAreaAuto from "$plasmid/components/TextAreaAutosize.svelte";

  import { page } from '$app/stores';
  export let data = $page.data, showDebug = false, classes="radius-xs border-red-10 bg-slate-50";
  export let cta="Submit", loading="Please wait...", success="Data Submitted!";
  export let formData = {}; // used in bind; don't erase!

  export let message=null, row=null

  let settings;
  if(row.YAML) {
    settings = YAML.parse(row.YAML)
    loading = settings?.form?.messages?.loading || loading;
    success = settings?.form?.messages?.success || success;
    cta = settings?.form?.messages?.cta || cta;
  }

  let tmpYaml = `
form:
  messages:
    cta: Join Waitlist
    loading: Adding your to waitlist...
    success: Waitlist Joined!
  schema:
    - name: Name
      type: text
      label: Name
      description: Please enter your full name
      placeholder: Full name
      required: true
    - name: Email
      type: email
      label: Email
      description: Enter your email so I can reach back out to you!
      placeholder: jane@example.com
      required: true
    - name: Ask
      type: text
      label: Website details
      placeholder: What are you looking to build? Please enter as much details here as possible!
      textarea: true
      required: true

`
  if(tmpYaml) {
    // settings = YAML.parse(tmpYaml)
    // loading = settings?.form?.messages?.loading || loading;
    // success = settings?.form?.messages?.success || success;
    // cta = settings?.form?.messages?.cta || cta;
  }

  // Client API:
  export const { form, enhance, errors, constraints } = superForm(data.form, {
    onError: ({ result }) => {
      console.log('Form error', result)
      message = result.error.message;
    },
    onUpdated: ({ form, page }) => {
      console.log('updated!!! form?!', form)
      if (form.valid) {
        message = success;
      } else {
        message = form.message;
      }
    },
    onSubmit: ({ action, formData, formElement, controller, submitter, cancel }) => {
      formData.set('hostname', $page.data.hostname); // sends data to right place
      formData.set('notion', row.Content); // use page.Content as the notionId
      if(settings?.form?.schema)
        formData.set('schema', JSON.stringify(settings?.form?.schema)); 
      // console.log('Form data:', Object.fromEntries(formData.entries()));
      message = loading;
    }
  });

  $: if(settings?.form?.schema) {
    settings?.form?.schema.forEach(field => {
      $form[field.name] = field.value || '';
    });
  }

  $: if($page.form) {
    formData = $page.form
  }


</script>

<div class="Component-Login-Form {classes}">
  <form method="POST" action="/api/actions/?/dataEntry" use:enhance >
    {#each settings?.form?.schema as field (field.name)}
      <label for={field.name}>{field.label}</label>
      {#if field.description}
        <div class="text-sm text-gray-500 mb-2">{field.description}</div>
      {/if}
      {#if field.textarea}
        <TextAreaAuto 
          id={field.name} 
          name={field.name}
          classes={"AddComments-comments-textarea p-4 mt-1 block w-full mb-4"}
          placeholder={field.placeholder}
          aria-invalid={$errors[field.name] ? 'true' : undefined}
          bind:value={$form[field.name]}  
          minRows={5}
          required={field.required}
        />
      {:else}
        <input
          class="py-2 px-4 mb-4"
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          aria-invalid={$errors[field.name] ? 'true' : undefined}
          value={$form[field.name]||''}
          on:input={(e) => $form[field.name] = e.target.value}
          {...$constraints[field.name]}
          required={field.required}
        />
      {/if}
      {#if $errors[field.name]}<div class="invalid mb-4">{$errors[field.name]}</div>{/if}
    {/each}
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
