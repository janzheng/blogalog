
<div id="formlet--{id}" class={`Formlet Formlet-checkboxgroup ${styles['formletClasses']}`}>
	<div class=" _form-control">
		<div id={id} class="" >
			<slot name="label">
				<div class={`${styles['labelContainer']||'paraWrap'}`}>
					{#if label}<label class={`Formlet-label ${styles['labelClasses']||''}`} for={id}>{@html marked(label)}</label>{/if}
					{#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
				</div>
		  </slot>

			{#each options as item}
		  	<label class="block w-full |  _form-checkbox-label __checkbox | input-formlet-checkers-label mb-2 " for={item['value']}>

					<input type="checkbox" 
				    id={item['value']}
				    value={item['value']}
				    name={item['value']}
						bind:group={value}
				    on:change={e=>handleInput(e,item)}
				    class={`inline-block align-middle | ${styles['fieldClasses']} ${$errors[id] && $errors[id].length>0 ? '_form-error' : ''}`}
					/>

	        <div class="inline-block align-middle | checkbox p-2 " for={item['value']}>
	          <div class="checkbox-content">
							<slot name='itemlabel'>
								<div class={`${styles['labelItemContainer']||'paraWrap'}`}>
						  		{@html marked(item['label'] || '')}
						  	</div>
							</slot>
	            <!-- <div v-if="option.name" class="_font-bold">name here</div> -->
	            <!-- <div v-if="option.description" class="" v-html="$md.strip($md.render(option.description || ''))" /> -->
	          </div>
	        </div>

		  	</label>
		  {/each}

		</div>

	  <!-- might be useful for minimum checked etc. -->
	  <!-- need to break these up per object -->
	  <!-- {#if $errors[id] && $errors[id].length>0}
			<slot name="error">
	  		<div class="Card-error mt-2 _error">{$errors[id]}</div>
			</slot>
	  {/if} -->
	</div>
</div>


<script>
  import { onMount } from 'svelte';
  import {marked} from 'marked';

	export let form, handleChange, errors
  export let field = {}
  let value=[]
  let {id, name, label, description, styles={}, type, options=[]} = field
  id = id || name // make sure id exists by id or name values

  // can't use bind here
  // $: if($form[id]) { // bind value
  //   value = $form[id]
  // }
	onMount(async () => {
		if($form[id]) {
			value = $form[id]
		}
	})

  const handleInput = (e, item) => {
    // $form[id] = value // this is more control than bind:value

  	e = {target: {
  		name: id,
  		value: value
  	}}
  	handleChange(e)
  }
</script>





