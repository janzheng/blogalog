
<div id="formlet--{id}" class={`Formlet Formlet-checkboxgroup ${styles['formletClasses']}`}>
	<div class=" _form-control">
		<div id={id} class="" >

			<slot name="label">
				<div class={`${styles['labelContainer']||'paraWrap'}`}>
					{#if label}<label class={`Formlet-label ${styles['labelClasses']||''} ${$errors[id] && $errors[id].length>0 && !Array.isArray($errors[id]) ? '_errortext' : ''}`} for={id}>{@html marked(label)}</label>{/if}
					{#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
				</div>
		  </slot>

			{#each options as item}
		  	<label class={`${styles['fieldLabelClasses'] || 'block w-full | _form-checkbox-label __checkbox | input-formlet-checkers-label mb-2'}`} bind:this={ref} for={item['value']}>

					<input type="checkbox" 
				    id={item['value']}
				    value={item['value']}
				    name={item['value']}
						bind:group={value}
				    on:change={e=>handleInput(e)}
				    class={`inline-block align-middle | ${styles['fieldClasses']} ${$errors[id] && $errors[id].length>0 ? '_form-error' : ''}`}
					/>

	        <div class="inline-block align-middle | checkbox p-2 " for={item['value']}>
	          <div class="checkbox-content pl-2">
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

			<!-- "Other" option -->
			{#if showOtherCheckbox}
				<label class={`${styles['fieldLabelClasses'] || 'block w-full | _form-checkbox-label __checkbox | input-formlet-checkers-label mb-2'}`} for={`${id}-other`}>

					<input type="checkbox" 
						id={`${id}-other`}
						checked={checkOther}
						name={`${id}-other`}
						on:change={()=>{checkOther=!checkOther}}
						class={`inline-block align-middle | ${styles['fieldClasses']} `}
					/>

					<div class="inline-block align-middle | checkbox p-2 ">
						<div class="checkbox-content pl-2">
							<slot name='itemlabel'>
								<div class="paraWrap">
									{@html marked(otherLabel || '')}
								</div>
							</slot>
						</div>
					</div>

				</label>
			{/if}

			<!-- textarea is the easiest to support; consider using the Select component instead -->
			{#if isFormletOpen && subformlet && subformlet.fields && subformlet.fields.length>0 && subformlet.fields[0].fieldType==='Textarea'}
				<Formlet
            formData={subformlet}
            on:update={(evt) => handleFormletUpdate(evt)} 
            formletClasses={{
              container:' ',
              formField:' ',
            }}
					/>
			{/if}
		</div>

	  <!-- might be useful for minimum checked etc. -->
	  <!-- need to break these up per object -->
	  {#if $errors[id] && $errors[id].length>0 && !Array.isArray($errors[id])}
			<slot name="error">
	  		<div class="Card-error mt-2 _error">{$errors[id]}</div>
			</slot>
	  {/if}
	</div>
</div>






<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import Formlet from "$lib/components/formlet/Formlet.svelte";
  import * as yup from "yup";

	export let form, handleChange, errors, touched
	export let field = {}, checkOther=false, isFormletOpen=false, otherval=undefined
	
  let value=[], ref
  let {id, name, label, description, styles={}, type, options=[], otherLabel='Other', showOtherCheckbox=false, subformlet} = field
  id = id || name // make sure id exists by id or name values

  // can't use bind here
  // $: if($form[id]) { // bind value
  //   value = $form[id]
  // }
	onMount(async () => {
		if($form[id]) {
			value = $form[id]
		}
    
		// if the last item starts with [other]
		if(value.length > 0 && value[value.length-1].startsWith('[other] ')) {
			otherval = value[value.length-1].substr(8) // cut out the "[other]" tag
			subformlet.yup.initialValues[subformlet.fields[0].name] = otherval
			checkOther = true
		}
	})

	$: { // unhandled vars
		touched
	}


	$: if($errors) { // unhandled vars
		// console.log('checkInput errors:', $errors)
	}

	$: {
		// figure out if formlet is open
		// IF showOtherCheckbox==true and checkOther==true
		// OR showOtherCheckbox==false
		if(!showOtherCheckbox || (showOtherCheckbox && checkOther))
			isFormletOpen = true
		else
			isFormletOpen = false
	}

  const handleInput = (e) => {
    // inject the event object
		// $form[id] = value // this is more control than bind:value

    if(otherval) { // if non-empty and we're updating it
      e = {target: {
        name: id,
        value: [...value, otherval]
      }}

      if(!otherval.startsWith('[other] '))
        otherval = value[value.length-1].substr(8) // cut out the "[other]" tag

    } else {
      e = {target: {
        name: id,
        value: value
      }}
    }

  	handleChange(e)
    return e
	}
	
	const handleFormletUpdate = (evt) => {
    
		let newval = evt.detail.state[Object.keys(evt.detail.state)[0]]
		if(newval) {
			if(newval.startsWith('[other] ')) {
				otherval = newval
			} else {
				otherval = `[other] ` + newval
			}

			// remove the previously stored value so the new one can replace it
			if(value.length > 0 && value[value.length-1].startsWith('[other] ')) {
				subformlet.yup.initialValues[subformlet.fields[0].name] = newval
				checkOther = true
				value.splice(value.length-1, 1)
			}

			let e = ref 
			handleInput(e)
		}
	}

</script>





