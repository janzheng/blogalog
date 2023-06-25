
<div id="formlet--{id}" class={`Formlet Formlet-input ${styles['formletClasses']||''}`}>
	 <slot name="label">
    <div class="{styles['labelContainer']||'paraWrap'}">
      {#if label}<label class={`Formlet-label ${styles['labelClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_errortext' : ''}`} for={id}>{@html marked(label)}</label>{/if}
      {#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
    </div>
  </slot>


  <input
    id={id}
    name={name}
    on:change={handleInput}
    on:blur={handleInput}
    placeholder={placeholder}
    type={type}
    value={value}
    class={`_form-input ${styles['fieldClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_form-error' : ''}`}
  />

  {#if $errors[id] && $errors[id].length>0}
		<slot name="error">
  		<div class="Card-error mt-2 _error">{$errors[id]}</div>
		</slot>
  {/if}
</div>


<script>
  import { onMount, tick } from "svelte";
  import {marked} from 'marked';

	export let form, handleChange, errors
  export let field = {}
  let value=''
  let {id, name, label, description, placeholder, styles={}, type} = field
  id = id || name // make sure id exists by id or name values

	onMount(async () => {
    value = $form[id] || ''
  })

	// $: { // unhandled vars
	// 	touched
	// }

  const handleInput = async (e) => {
    $form[id] = e.target.value // this is more control than bind:value
    handleChange(e)
    await tick()
  }

</script>