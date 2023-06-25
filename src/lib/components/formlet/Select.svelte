
<div id="formlet--{id}" class={`Formlet Formlet-select ${styles['formletClasses']}`} style={listOpen? 'z-index: 8888': ''}>
	<div class="_form-control">
	  <slot name="label">
			<div class="{styles['labelContainer']||'paraWrap'}">
				{#if label}<label class={`Formlet-label ${styles['labelClasses']||''}`} for={id}>{@html marked(label)}</label>{/if}
				{#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
			</div>
	  </slot>
		<Select items={options} bind:listOpen={listOpen} bind:this={ref} {...selectOptions} bind:value={value} on:select={handleInput} on:clear={handleInput} containerClasses="" />
    <!-- 
			<Select items={options} 
				isCreatable={true} 
				placeholder={`Choose something`}
				isMulti={true}
				bind:value /> 
		-->

    {#if $errors[id] && $errors[id].length>0}
      <slot name="error">
        <div class="Card-error mt-2 _error">{$errors[id]}</div>
      </slot>
    {/if}
	</div>
</div>




<script>
  import { onMount, tick } from 'svelte';
	import Select from 'svelte-select'
  import {marked} from 'marked';
	
	export let form, handleChange, errors, touched
  export let field = {}
  let value = undefined, ref, banana
  let {id, name, label, description, placeholder, styles={}, type, options=[], selectOptions={} } = field
  let listOpen
  id = id || name // make sure id exists by id or name values

	$: { // unhandled vars
		errors, touched
	}

  // $: if($form[id]) { // bind value
  //   value = $form[id]
  // }
	onMount(async () => {
		if($form[id]) {
			value = $form[id]

      if(value && value.length > 0) {
        value.map((val,i) => {
          if(!val) // remove empty ones as a guard
            value.splice(i)
        })
      }
		}
	})

  const handleInput = async (event) => {
    // handle clear events for isMulti a bit differently
    // this case, it returns the removed item, which we remove from the value
    if(event.type == "clear" && selectOptions.isMulti) {
      // value.splice(event.detail['index'])
    } else {
      value = event.detail
    }

  	// create a fake node for svelte forms
    // console.log('select input: ', event, value)

  	let e = ref
  	e = {
      ...e,
      target: {
        name: id,
        value: value
      }
    }

    $form[id] = value

    // required by svelte forms
    handleChange(e)
    await tick()
  }
</script>



<style lang="scss" global>

  $border-thin: 2px;
  $size: 1rem;
  $height-input: 3rem; //inherit; // coeur sets a height limit on inputs, but we don't want that here
  $radius: 0.375rem;
  $font-small: 0.825rem;




.Formlet-select,
.Formlet-quant {

  // vars used by svelte-select
  position: relative;
  z-index: 100;

  .selectContainer {
    input {
      // cancles the input focus box shadow for all inputs
      box-shadow: none;
    }

    // for clearing (clearSelect) multi selects
    input+div {
      // left: -2px !important; // needed if input has a 2px border
    }
  }

  // this div offset gets screwed up with thick borders
  .clearSelect~div {
    right: 4px !important;
  }



  --border: #{$border-thin solid } rgb(191 219 254);
  --borderPadding: 4px;
  --inputFontSize: #{$size};
  --borderHoverColor: #{rgb(59 130 246)};
  --itemHoverBG: #{rgb(191 219 254)};
  --height: #{$height-input - 0.25rem};
  --listMaxHeight: #{$height-input * 6.52};
  --inputPadding: #{$size};
  --multiItemBorderRadius: #{$radius};
  --multiItemMargin: #{$size *0.5 + 0.0625rem $size *0.5 + 0.0625rem $size*0.5 + 0.0625rem 0};
  --clearSelectWidth: #{$size * 1.8};
  --clearSelectColor: #{rgb(191 219 254)};
  --clearSelectHoverColor: #{rgb(59 130 246)};
  --borderRadius: 0.375rem;
}


  // .Formlet-select input {
  //   @apply rounded-md bg-white border-blue-100 focus:border-blue-500 border-2 focus:bg-white focus:ring-0;
  //   @apply hover:border-blue-500 hover:transition-all ease-in-out cursor-pointer;
  // }

  .Formlet-select .selection {
    position: relative;
    left: 3px;
    // font-size: 0.88rem;
  }
  
  // .Formlet-select .selectContainer {
  //   border: none !important;
  // }


  // selectContainer has the border styling- necessary for multiSelect
  // (as input only takes up the field partially)
  // needs to override global styling
  .Formlet-select .selectContainer:not(.multiSelect) {
    // make the container a bit bigger to cover for border width
    // but only for single select (or it can't grow)
    height: calc(var(--height,42px) + 8px) !important;
  }
  .Formlet-select .selectContainer > input {
    border-width: 0 !important;
    margin: var(--multiSelectInputMargin, 4px) !important;
    width: calc(100% - 4px) !important;
  }
  
  .Formlet-select .selectContainer {
    // height: inherit !important; // prevents input from blowing outside select
    // @apply rounded-md;
  }
  
  .Formlet-select .listContainer {
    left: -2px; // slightly off
  }

  .Formlet-select .clearSelect {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
</style>