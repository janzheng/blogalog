
<form class={`${formletClasses.container ? formletClasses.container : '_form-control'}`} 
  method="POST"
  action="{actionRoute}"

  use:enhance={async ({ form, data, cancel }) => {
    await validateForm()
    // console.log('Using enhance to submit form; errors:', hasPageErrors)
    if(!hasPageErrors) {
      isSubmitting = true
      console.log('[Formlet] Form has no errors. Submitting. ', hasPageErrors)
      if(enhanceFn({ form, data, cancel }, get(formStore)["form"])) {
        // NOTE: using enhanceFn and formData won't get the "complex" form elements like compound checkbox or radiogroup inputs
        // these have to be added manually with data.set('key', dataValue) in the enhance fn
        return async ({ result, update }) => {
          if(enhanceResultFn)
            return enhanceResultFn({ result, update })
          isSubmitting = false
        }
      }
    } else {
      isSubmitting = false
      console.error('[Formlet] Form has errors. Not submitting. ', hasPageErrors)
      cancel()
      return false
    }
  }}

  on:submit={async (e)=>{
    await validateForm()
    handleSubmit(e)
  }}
  >

  {#if form}
    {#each formFields as field (`${field.name}-${$touched[field.id] || $touched[field.name]}`)}
      <div class={`${formletClasses.formField ? formletClasses.formField : 'mb-4'}`}>
        <svelte:component this={fieldComponents[field.fieldType]} 
          field={field} {handleChange} {errors} {form} >
        </svelte:component>
      </div>
    {/each}

    <!-- {#if formData.settings && formData.settings.submitText}
      <div class="mt-4">
        <input type="submit" value={formData.settings && formData.settings.submitText} class=" {formStyles['submittingButtonClasses'] || 'Btn-solid ease-in-out block'} "> 
      </div>
    {/if} -->

    <slot name="preCheckout">
      <!-- <div>default</div> -->
    </slot>

    {#if formData.settings && formData.settings.submitText}
      {#if isSubmitting}
        <button type="submit" class="submittingButtonClasses {formStyles['submittingButtonClasses'] || 'Btn-solid __cta ease-in-out mb-0'} ">{formData.settings&&formData.settings.submittingText || "Submitting..."}</button>
      {:else}
        <button type="submit" class="submitButtonClasses {formStyles['submitButtonClasses'] || 'Btn-solid ease-in-out mb-0'} ">{formData.settings&&formData.settings.submitText || "Submit"}</button>
      {/if}
    {/if}

    <!-- random debug crpa -->
    <!-- success? {success} || hasPageErrors? {hasPageErrors} | ?? Object.keys($errors): {Object.keys($errors).length} -->
    <!-- <pre>{JSON.stringify($errors)}</pre> -->
    <!-- lol ugh??[{Object.keys($errors).filter((ek)=>{return $errors[ek].length>0})}]?? -->
    <!-- what: { Object.keys($errors).filter((ek)=>{return $errors[ek].length>0}).length} -->

    <!-- hasPageErrors appears even when no errors exist, bc it only runs when submitted -->
    <!-- {#if hasPageErrors} -->
    <!-- {JSON.stringify(Object.keys($errors).filter((ek)=>{return $errors[ek].length>0}))} -->
    {#if Object.keys($errors).filter((ek)=>{return $errors[ek].length>0}).length > 0}

      <div class="Formlet-page-errors Card-danger p-4 mt-2" transition:fade>
        {#if formData.settings && formData.settings.pageErrorText}
          <div class="Formlet-page-errors-message__">{@html marked(formData.settings.pageErrorText)}</div>
        {:else}
          <div class="Formlet-page-errors-message">Please correct the following errors:</div>
        {/if}
        <ul class="pb-0">
          {#each Object.keys($errors) as errorKey}
            {#if $errors[errorKey].length>0 && !Array.isArray($errors[errorKey])}
              <li><span class="Btn-link" on:click={(e)=>{scrollToAnchor(errorKey)}} on:keypress={(e)=>{scrollToAnchor(errorKey)}} style="display: inline">{$errors[errorKey]}</span></li>
              <!-- <li><a class="__underline-none __normal" href={`${$page.url.pathname}?page=${curPageNumber+1}#${errorKey}`} on:click={(e)=>{e.preventDefault(); scrollToAnchor(`formlet--${errorKey}`)}}>{$errors[errorKey]}</a></li> -->
            {/if}
          {/each}
        </ul>
      </div>
    {/if}
    <!-- {#if hadPageErrors && !hasPageErrors && success} -->
    {#if hadPageErrors && Object.keys($errors).filter((ek)=>{return $errors[ek].length>0}).length == 0}
      <div class="Formlet-page-errors Card-success p-4 mt-2" transition:fade>
        No more errors!
      </div>
    {/if}
    
  {/if}
</form>
<!-- TODO: error messaging (e.g. server error) or success -->



<script>
  import { enhance } from '$app/forms';
  import { fade, fly } from 'svelte/transition';
  import { tick } from "svelte";
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";

  import { scrollToAnchor } from "$plasmid/utils/scrollto.js";
  // import { zzz } from "$plasmid/utils/helpers.js";=

  import { get } from "svelte/store";
  import { marked } from "marked";

  import Input from "$lib/components/formlet/Input.svelte";
  import Textarea from "$lib/components/formlet/Textarea.svelte";
  import Richtext from "./Richtext.svelte";
  import Checkbox from "$lib/components/formlet/Checkbox.svelte";
  import Radiogroup from "$lib/components/formlet/Radiogroup.svelte";
  import Checkboxgroup from "$lib/components/formlet/Checkboxgroup.svelte";
  import Select from "$lib/components/formlet/Select.svelte";
  import SelectRadio from "$lib/components/formlet/SelectRadio.svelte";
  import CheckInput from "$lib/components/formlet/CheckInput.svelte";

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let hasPageErrors=false, hadPageErrors=false, isReset=false


  const fieldComponents = {
    Input: Input,
    Textarea: Textarea,
    Richtext: Richtext,
    Checkbox: Checkbox,
    Radiogroup: Radiogroup,
    Checkboxgroup: Checkboxgroup,
    Select: Select,
    SelectRadio: SelectRadio,
    CheckInput: CheckInput,
  };

  // yup schema: https://www.npmjs.com/package/yup
  export let formData, formStore=undefined, formletClasses={}
  export let formFields = formData.fields
  export let formStyles = formData['styles'] || {}
  export let isSubmitting
  export let actionRoute = '/'
  export let enhanceFn, enhanceResultFn

  let success = false

  export let baseForm, form, errors, state, handleChange, handleSubmit, touched, isValid, isValidating, validateField

  $: if(formData) {
    // let newForm
    baseForm = createForm(
      {
        initialValues: formStore && get(formStore)["form"] ? get(formStore)["form"] : formData.yup.initialValues,
        validationSchema: yup.object().shape(formData.yup.validators),
        onSubmit: async data => {
          if(formData.submitHandler) {
            formData.submitHandler({state: get(form), data: formData})
          }
          dispatch('submit', {state: get(form), data: formData})
        }
      }
    )
    if(baseForm) {
      form = baseForm['form']
      errors = baseForm['errors']
      state = baseForm['state']
      handleChange = baseForm['handleChange']
      handleSubmit = baseForm['handleSubmit']
      touched = baseForm['touched']
      isValid = baseForm['isValid']
      isValidating = baseForm['isValidating']
      validateField = baseForm['validateField']
    }

  }

  // update on touched or external form updates
  $: if ($touched || $form) {
    // console.log('[Formlet] update', $touched, $form, $errors)
    // console.log('[Formlet] update \n ---> [touched]', $touched, '\n ---> [form]', $form, '\n ---> [store]',$formStore, '\n ---> [errors]',$errors)
    success = false;

    if(formStore) {
      formStore.update(store => {
        store["form"] = get(form);
        return store;
      });
    }

    dispatchUpdate();
  }


  let dispatchUpdate = async () => {
    await tick();
    // console.log('[dispatch::update]',formData, get(form))
    // if($isValidating == false)
    //   await validateForm();
    await dispatch('update', {state: get(form), data: formData});
  };


  export const validateForm = async () => {
    // validate the page's fields
    let pageErrors = false
    hasPageErrors = false
    // $isValidating = true
    let validations = formFields.map(async f => {
      await validateField(f.id || f.name)
      if($touched[f.name] && $errors[f.name].length>0) {
        pageErrors = true
        success = false
      } else {
        if(pageErrors==false) success = true
      }
    })
    await Promise.all(validations)
    // $isValidating = false

    if(pageErrors == false) {
      hasPageErrors = false 
      // if(pageErrors==false) hasPageErrors = false 
    } else {
      hasPageErrors = true
      hadPageErrors = true // helpful for error messages
    }

    // console.log('validatePage:', pageErrors, hasPageErrors, $errors)
    return hasPageErrors
  };

</script>


<style lang="postcss">
</style>



