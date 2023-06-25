
<div id="formlet--{id}" class={`Formlet Formlet-input ${styles['formletClasses']||''}`}>
	 <slot name="label">
    <div class="{styles['labelContainer']||''}">
      {#if label}<label class={`Formlet-label ${styles['labelClasses']||''}`} for={id}>{@html marked(label)}</label>{/if}
      {#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
    </div>
  </slot>

</div>


<script>
  import { onMount, tick } from "svelte";
  import {marked} from 'marked';

	export let form, handleChange, errors
  export let field = {}
  let value=''
  let {id, name, label, description, placeholder, styles={}, type} = field
  id = id || name // make sure id exists by id or name values


	$: { // unhandled vars
		errors, form, handleChange
	}


</script>