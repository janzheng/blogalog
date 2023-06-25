
<!-- 
	this is for single checkbox items, like T&C or confirmation boxes
 -->

<div id="formlet--{id}" class={`Formlet Formlet-checkbox ${styles['formletClasses']||''}`}>
	<div class="Formlet-checkboxgroup">
		<div class="_form-checkbox" >
	  	<label class="_form-checkbox-label __checkbox | input-formlet-outline input-formlet-outline-hover py-4 px-4 w-full | flex" for={id}>
				
				<input type="checkbox" 
			    id={id}
			    name={name}
					bind:checked={$form[id]}
			    on:change={handleInput}
			    on:blur={handleInput}
			    class={`inline-block align-middle | self-center flex-none |  ${$errors[id] && $errors[id].length>0 ? '_form-error' : ''}`}
				/>

        <div class={`self-center flex-1 pt-1 | checkbox | cursor-pointer-deep ${styles['fieldClasses']}`} for={id}>
          <div class="checkbox-content pl-4">
					  <slot name="label">
							<div class="{styles['labelContainer']||''}">
								{#if label}<label class={`Formlet-label | ${styles['labelClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_errortext' : ''}`} for={id}>{@html marked(label)}</label>{/if}
								{#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
							</div>
					  </slot>
          </div>
        </div>

	  	</label>

		</div>

	  <!-- for things like "you must check this box" -->
	  {#if $errors[id] && $errors[id].length>0}
			<slot name="error">
	  		<div class="Card-error mt-2 _error">{$errors[id]}</div>
			</slot>
	  {/if}
	</div>
</div>


<script>
  import {marked} from 'marked';

	export let form, handleChange, errors
  export let field = {}
  let value=''
  let {id, name, label, description, placeholder, styles={}, type, rows=4} = field
  id = id || name // make sure id exists by id or name values



  const handleInput = (e) => {
    handleChange(e)
  }
</script>


<style lang="postcss" global>

._form-checkbox {

  // ._form-checkbox-label {
  //   @apply rounded-md bg-white border-blue-100 focus:border-blue-500 border-2 focus:bg-white focus:ring-0 p-4 w-full block hover:border-blue-500 hover:transition-all ease-in-out cursor-pointer;

  //   &, * {
  //     @apply cursor-pointer;
  //   }
  // }

  .Formlet-description {
    p:last-of-type {
      padding-bottom: 0;
    }
  }
}

</style>