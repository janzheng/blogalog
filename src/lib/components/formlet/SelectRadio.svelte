<script>
  import { tick, onMount } from "svelte";
  import Select from "svelte-select";
  import {marked} from "marked";
  import * as yup from "yup";
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import Formlet from "$lib/components/formlet/Formlet.svelte";

  let ref
  export let form, handleChange, errors, touched
  export let field = {}
  export let formState = []; // <--- use formState to bind to parent and as the official state of this form
  let selectedValue = undefined,
    selectedItems = [];
  let {
    id,
    name,
    label,
    description,
    placeholder,
    styles = {},
    type,
    options = [],
    selectOptions = [],
    subformlet,
    reverse = true,
    emptystate = 'Please choose an option from above',
    hideSelect = false, // lets you hide the Select component (to only show the options)
  } = field;
  id = id || name; // make sure id exists by id or name values

  let remainingOptions;

  $: {
    remainingOptions = options.filter((o) => {
      if (!selectedItems.some((e) => e.value == o.value)) return o;
    });
  }

	$: { // unhandled vars
		touched, errors
	}


  selectOptions = { ...selectOptions, isCreatable: true };

  // set initial value
  onMount(async () => {
    if ($form[id]) {
      // selectedValue = $form[id]
      selectedItems = [...$form[id]]; // need to make copies!!
      formState = [...$form[id]];
    }
  });

  // handles the select / main input
  const handleInput = async (e) => {
    let newItem = e.detail;

    if (reverse) {
      selectedItems = [newItem, ...selectedItems];
      formState = [newItem, ...formState];
    } else {
      selectedItems = [...selectedItems, newItem];
      formState = [...formState, newItem];
    }

    await tick(); // important
    selectedValue = undefined;
  };

  // handle the embedded formlet update
  // this gets triggered immediately when default values exist
  const handleFormletUpdate = (item, i, evt) => {

    let formlet = evt.detail;

    let formItemIndex = formState.findIndex(fs => fs.value == item.value)
    let formStateItem = formState[formItemIndex]
    
    // these only work for SINGLE formlet children
    let key = Object.keys(formlet.state)[0]
    let basekey = Object.keys(formlet.state)[0].split('::')[1] // strips out the extra identifier (identifier::key)
    let value = formlet.state[key] 

    formStateItem[basekey] = value // force the base value back into the form state; only works for one item currently

    // console.group('[handleFormletUpdate]')
    //   console.log('formlet:', formlet)
    //   console.log('item:', item)
    //   console.log('formState:', formState)
    //   console.log('basekey:', basekey)
    //   console.log('value:', value)
    //   console.log(formStateItem)
    // console.groupEnd()

    // works for multiple, but really bad to use index, since it prevents list reversal
    // formlet.data.fields.map(field => {
    //   let rootName = field.rootName
    // })

    // Object.keys(formlet).map((stateKey, j) => {
    //   let fieldName = subformlet.fields[j]["name"];
    //   formState[i] = {
    //     ...formState[i],
    //     ...{ [fieldName]: formlet[stateKey] },
    //   };
    // });

    // // create a fake node for svelte forms
    let e = ref;
    e = {
      target: {
        name: id,
        value: formState,
      },
    };
    // console.log('input: ', id, e)
    handleChange(e);

    // console.log("[SelectRadio] state update:", formState);
  };

  const handleClear = () => {
    console.log("handling clear .... ");
    selectedValue = { value: "foo", label: "Default" };
  };


  // edits the form data w/ information about the root form
  const genSubformData = (item) => {
    // slow but easy to implement; makes a copy
    let subform = JSON.parse(JSON.stringify(subformlet));
    subform.yup.validators = { ...subformlet.yup.validators }; // assign validators back

    let subformData = { root: item.value, ...subform };
    // console.log('genSubformData -)-)-)--', item, item.value, subformData, subformData.fields, selectedItems)

    // need to add the item value name, e.g. 'candy' to each subform value option to make their ids unique
    subformData.fields.map((f) => {

      let initialValue = subformData.yup.initialValues[f["name"]];

      // selectedItems.filter((o) => o[f['name']])
      selectedItems.forEach((o) => {
        // console.log('boop boop ', item, o, o[f['name']])
        if(item.value == o.value && o[f['name']])
          initialValue = o[f['name']]
      })

      // console.log('>>>>>???? initialValues', initialValue, item, item[f['name']])
      delete subformData.yup.initialValues[f["name"]];
      subformData.yup.initialValues[`${item.value}::${f["name"]}`] = initialValue;

      // assign validator
      let validator = subformData.yup.validators[f["name"]];
      delete subformData.yup.validators[f["name"]];
      subformData.yup.validators[`${item.value}::${f["name"]}`] = validator;

      f["rootName"] = f["name"] ? `${f["name"]}` : undefined; // preserve the root name
      f["name"] = f["name"] ? `${item.value}::${f["name"]}` : undefined;

      f.options.map((o) => {
        o["id"] = `${item.value}::${o["value"]}`;
        o["name"] = `${item.value}::${o["value"]}`;
        o["value"] = `${o["value"]}`;
      });
    });

    // subformData.fields.map((f) => {
    //   // assign initialValues schema
    //   let initialValues =
    //     formState[i] && formState[i][f["name"]]
    //       ? formState[i][f["name"]]
    //       : subformData.yup.initialValues[f["name"]];

    //   console.log('>>>>>???? initialValues', initialValues, formState[i], formState[i][f['name']])
    //   delete subformData.yup.initialValues[f["name"]];
    //   subformData.yup.initialValues[`${item.value}::${f["name"]}`] = initialValues;

    //   // assign validator
    //   let validator = subformData.yup.validators[f["name"]];
    //   delete subformData.yup.validators[f["name"]];
    //   subformData.yup.validators[`${item.value}::${f["name"]}`] = validator;

    //   f["name"] = f["name"] ? `${item.value}::${f["name"]}` : undefined;

    //   f.options.map((o) => {
    //     o["id"] = `${item.value}::${o["value"]}`;
    //     o["name"] = `${item.value}::${o["value"]}`;
    //     o["value"] = `${o["value"]}`;
    //   });
    // });

    // console.log('&&&&&&&&&& new data form:', subformData)
    return subformData;
  };



  const handleClearSubform = async (item, i) => {

    let formItemIndex = formState.findIndex(fs => fs.value == item.value)
    // let formStateItem = formState[formItemIndex]

    let selectedItemsIndex = selectedItems.findIndex(fs => fs.value == item.value)
    // let selectedItemsItem = selectedItems[selectedItemsIndex]

    // console.group('[handleClearSubform]')
    //   console.log('item:', item, i)
    //   console.log('formState:', formState)
    //   // console.log('formStateItem:', formStateItem, formItemIndex)
    //   console.log('selectedItems:', selectedItems)
    //   // console.log('selectedItemsItem:', selectedItemsItem, selectedItemsIndex)
    // console.groupEnd()

    formState.splice(formItemIndex, 1);
    selectedItems.splice(selectedItemsIndex, 1);

    // create a fake node for svelte forms
    let e = ref;
    e = {
      target: {
        name: id,
        value: formState,
      },
    };
    // console.log('input: ', id, e)
    handleChange(e);

    await tick(); // important
    formState = formState;
    selectedItems = selectedItems;

    // //reactivity update
    // console.log('handleClearSubform: ', i, selectedItems, formState)
    
  };
</script>

<style global lang="postcss">
  // inherited from Select object
  .selectRadio-clearSelect {
    position: absolute;
    padding: 0;
    height: 36px;
    // height: var(--height, 36px);
    right: var(--clearSelectRight, 0px);
    top: var(--clearSelectTop, 0px);
    // right: var(--clearSelectRight, 10px);
    // top: var(--clearSelectTop, 11px);
    bottom: var(--clearSelectBottom, 11px);
    width: var(--clearSelectWidth, 1.5rem);
    color: var(--clearSelectColor, rgb(37 99 235/var(--tw-bg-opacity)));
    flex: none !important;

    &:hover {
      color: var(--clearSelectHoverColor, rgb(29 78 216/var(--tw-bg-opacity)));
    }
  }


  .Formlet-selectRadio .selection {
    position: inherit;
    left: 3px;
    // font-size: 0.88rem;
  }

  .Formlet-selectRadio .selectContainer {
    border: none !important;
  }
</style>















<div id="formlet--{id}" class={`Formlet Formlet-select Formlet-selectRadio ${styles['formletClasses']}`}>
  <div class="_form-control">
    <slot name="label">
      <div class="{styles['labelContainer']||'paraWrap'}">
        {#if label}<label class={`Formlet-label ${styles['labelClasses']||''}`} for={id}>{@html marked(label)}</label>{/if}
        {#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
      </div>
    </slot>

    {#if !hideSelect}
      <div class="_Formlet-selectRadio-selectContainer | input-formlet-outline-hover | mb-2">
        <Select
          items={remainingOptions}
          bind:this={ref}
          {...selectOptions}
          bind:selectedValue
          on:select={handleInput}
          on:clear={handleClear} />
      </div>
    {/if}

    <!-- list values selected here -->
    <div class={`selectRadio-item-container  ${styles['radioItemContainerClasses']||''}`}>
      {#each selectedItems as item, i (item.value)}
        <div class={`selectRadio-item | input-formlet-outline hover:border-blue-100 cursor-default py-2 px-4 mb-2 ${styles['radioItemClasses']||''} relative`} transition:fly="{styles['radioItemTransition']||{y:-100, duration:150}}" animate:flip="{{duration: 150}}">
          <div class={`selectRadio-item-label relative`}>
            <div class={`selectRadio-item-label-div | text-lg |${styles['radioItemLabelClasses']||'mb-4'}`}>{@html marked(item.label)}</div>
            {#if !hideSelect}
              <!-- if Select is hidden, we shouldn't be able to close -->
              <button
                class={`_button __text selectRadio-clearSelect __pointer ${styles['radioClearSelectClasses']||''}`}
                on:click|preventDefault={(e) => handleClearSubform(item, i)}>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="-2 -2 50 50"
                  focusable="false"
                  role="presentation"
                  ><path
                    fill="currentColor"
                    d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z" /></svg>
              </button>
            {/if}
          </div>
          <div class={`selectRadio-formlet-container ${styles['formletContainerClasses']||''}`}>
            <Formlet
              formData={genSubformData(item, i)}
              on:update={(evt) => handleFormletUpdate(item, i, evt)} 
              formletClasses={{
                container:' ',
                formField:' ',
              }}
              />
            <!-- <Formlet formData={genSubformData(item)} /> -->
          </div>
        </div>
      {:else}
        <div class={`selectRadio-item | input-formlet-outline | p-4 bt-2 relative paraWrap ${styles['emptystateClasses']||''}`}>
          {@html marked(emptystate)}
        </div>
      {/each}
    </div>

    <!-- not implemented correctly currently -->
    <!-- {#if $errors[id] && $errors[id].length>0}
      <slot name="error">
        <div class="Card-error mt-2 _error">{$errors[id]}</div>
      </slot>
    {/if} -->
  </div>
</div>
