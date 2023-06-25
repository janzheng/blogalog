
<div id="formlet--{id}" class="Formlet Formlet-radiogroup _form-control {styles['formletClasses']} {$errors[id] && $errors[id].length>0 ? '_error' : ''}">
	<div class="">
		<div id={id} class="" >

			<slot name="label">
				<div class="{styles['labelContainer']||'paraWrap'}">
					{#if label}<label class={`Formlet-label ${styles['labelClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_errortext' : ''}`} for={id}>{@html marked(label)}</label>{/if}
					{#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
				</div>
		  </slot>

			{#each options as item, i}
		  	<label class={`${styles['fieldLabelClasses'] || 'block w-full input-formlet-checkers-label'} | _form-radio-label __radiomark | ${styles['rowClasses']||'mb-2'} | ${i==0&&styles['rowFirstClasses']||''} | ${i==item.length-1&&styles['rowLastClasses']||''}`} for={item['id'] || item['value']} bind:this={ref}>
					<input type="radio" 
				    id={item['id'] || item['value']}
				    value={item['value']}
				    name={id || item['value']}
						bind:group={value}
            
				    on:change={e=>handleInput(e,item)}
            data-label={item['label']}
				    class={`inline-block align-middle | ${styles['fieldClasses']} ${$errors[id] && $errors[id].length>0 ? '_form-error' : ''}`}
					/>

	        <div class="inline-block align-middle | radiomark p-2" for={item['value']}>
	          <div class="radiomark-content">
							<slot name='itemlabel'>
								<div class="{styles['labelItemContainer']||'paraWrap'}">
						  		{@html marked(item['label'] || '')}
						  	</div>
							</slot>
	          </div>
	        </div>

		  	</label>
		  {/each}

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

	  <!-- for things like "you must check this box" -->
	  {#if $errors[id] && $errors[id].length>0}
			<slot name="error">
	  		<div class="Card-error mt-2 _error">{$errors[id]}</div>
			</slot>
	  {/if}
	</div>
</div>



<!-- 

  algo:
  - if the LAST item is selected
    - replace form value with the value of the subformlet
  
  - on load, if the value UNKNOWN
    - open the subformlet
    - check the last value
    - set the subformlet data w/ the UKNOWN value

 -->


<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import Formlet from "$lib/components/formlet/Formlet.svelte";

	export let form, handleChange, errors, touched;
  export let field = {}, formState, checkOther=false, isFormletOpen=false, otherval=undefined;
  let value='', ref;
  let {id, name, label, description, styles={}, type, options=[], otherLabel='Other', showOtherBox=false, subformlet} = field;
  id = id || name; // make sure id exists by id or name values

	onMount(async () => {
    // if the value is UNKNOWN, open the subformlet
    options[options.length -1], value == options[options.length -1]?.value
    // set the value to the LAST value ("other")
    // set the formlet value to the UNKNOWN value
  })


	$: if($form[id]) { // bind value
    value = $form[id]['value']; // for value + label

    // if value doesn't exist in options
    if(value && !options.find(opt=>opt.value==value)) {
      options.push({
        value: value,
        label: value,
      })
      
      // swap the last item with the next to last item in options
      let last = options[options.length -1];
      let nextToLast = options[options.length -2];
      options[options.length -1] = nextToLast;
      options[options.length -2] = last;

      // open the subformlet
      isFormletOpen = true;
    }

    // if the last value is selected
    if(value == options[options.length -1]?.value) {
      // open the subformlet
      isFormletOpen = true;
    }

    // update the formState
		formState = $form[id];
  }

	$: {
		// figure out if formlet is open
		if(showOtherBox && value == options[options.length -1]?.value)
			isFormletOpen = true;
		else
			isFormletOpen = false;
	};
  
  const handleInput = (e, item) => {
    $form[id] = item // this is more control than bind:value
		// trick the form builder into accepting the new value
  	e = {target: {
  		name: id,
  		value: item, // item['value']
		}}
    
    // console.log('radio target:', item)
  	handleChange(e);
  };


	const handleFormletUpdate = (e) => {
    console.log('handleFormletUpdate', e.detail.state)

    if(e.detail.state[Object.keys(e.detail.state)[0]]) {
      // this is just the string, but we need to pretend to be the value/label pair
      let newVal = e.detail.state[Object.keys(e.detail.state)[0]]
      handleInput(e,{
        value: newVal,
        label: newVal,
      }) // use the textarea value to replace the "other" placeholder
    }
	};
</script>





<style lang="postcss">


  // .__inline {
	// 	.__radiomark {
	// 		display: inline-block !important;
	// 		margin-right: 0.5rem;
	// 		&:last-child {
	// 			margin-right: 0
	// 		}

	// 		.radiomark {
	// 			padding: 0.2rem 0.5rem;
	// 			&:before {
	// 				left: 7px;
	// 			}
	// 			&:after {
	// 				left: 11px;
	// 			}
	// 		}
	// 	}
  // }
</style>

