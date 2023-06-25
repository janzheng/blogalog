
<div id="formlet--{id}" class={`Formlet Formlet-richtext ${styles['formletClasses']||''}`}>
	 <slot name="label">
    <div class="{styles['labelContainer']||'paraWrap pb-2'}">
      {#if label}<label class={`Formlet-label ${styles['labelClasses']||''} ${$errors[id] && $errors[id].length>0 ? '_errortext' : ''}`} for={id}>{@html marked(label)}</label>{/if}
      {#if description}<label class={`Formlet-description ${styles['descriptionClasses']||''}`} for={id}>{@html marked(description)}</label>{/if}
    </div>
  </slot>

  
  {#if browser && loaded && Tiptap}
    <div class={`Tiptap ${styles['containerClasses']||'Card-shadow p-4 mb-2 focus-within'}`}>
      <Tiptap 
        id={id}
        name={name}
        content={value}
        placeholder={settings.placeholder}
        bind:html={html}
        bind:charCount={charCount}
        on:blur={handleInput}
      ></Tiptap>
    </div>
  {/if}

  {#if settings && settings.showMaxRemaining && charCount}
    <div class="_font-small pt-2" >
      <span>Characters: { charCount } / { settings.maxLength }</span>
      <!-- {#if settings.maxLength >= charCount}
        <span>{ settings.maxLength - charCount } characters left</span>
      {:else}
        <span class="_font-error">{ Math.abs(settings.maxLength - charCount) } characters over</span>
      {/if} -->
    </div>
  {/if}

  {#if settings && settings.showCharCount}
    <div class="_font-small pt-2" >
      <span>Characters: { charCount } Characters</span>
    </div>
  {/if}

  {#if settings && settings.minLength && settings.showMinChars && (charCount - settings.minLength) < 0}
    <div class="_font-small pt-2" >
      <span>Write at least { Math.abs(charCount - settings.minLength) } more characters</span>
    </div>
  {/if}
  
  <!-- <div v-if="input.maxLength" class="_font-small pt-2" >
    <div v-if="input.showMaxRemaining">
      <span v-if="input.maxLength >= length">{{ input.maxLength - length }} characters left</span>
      <span v-else class="_font-error">{{ Math.abs(input.maxLength - length) }} characters over</span>
    </div>
    <div v-else>
      <span v-if="v.maxLength != false">Characters: {{ length }}</span>
      <span v-else class="_font-error">{{ Math.abs(input.maxLength - length) }} characters over</span>
    </div>
  </div>

  <div v-if="input.minLength && input.showMinChars && (length - input.minLength) < 0" class="_font-small pt-2" >
    <span>Write at least {{ Math.abs(length - input.minLength) }} more characters</span>
  </div> -->
  
  {#if $errors[id] && $errors[id].length>0}
		<slot name="error">
  		<div class="Card-error mt-2 _error">{$errors[id]}</div>
		</slot>
  {/if}
</div>


<script>
  import { browser } from '$app/environment';
  import { onMount, tick } from "svelte";
  import {marked} from 'marked';
  // import Tiptap from '../tiptap/Tiptap.svelte'
  let Tiptap

	export let form, handleChange, errors, loaded
  export let field = {}
  let value='', html, charCount
  let {id, name, label, description, placeholder, styles={}, type, rows=4, settings={}} = field
  id = id || name // make sure id exists by id or name values

	onMount(async () => {
    // 
    if (typeof window !== 'undefined') {
      // this prevents SSR from screwing with prosemirror
      Tiptap = (await import('../tiptap/Tiptap.svelte')).default;
    };


    value = $form[id] || ''
    html = value
    loaded = true

  	let e = {target: {
  		name: id,
  		value: $form[id] 
  	}}

    // force svelte-forms to sync; this prevents weird re-rendering issues
    handleChange(e);

    // this initializes tiptap
    value = $form[id] && $form[id].content || $form[id] || '(please enter some text)'
  });

  $: if(html) {
    // console.log('richtext editor html updated:', html);
    $form[id] = html // this is more control than bind:value
  };

  const handleInput = async (evt) => {
    // $form[id] = html // this is more control than bind:value
    let detail = evt.detail; // {content, charcount}
    $form[id] = detail; // this is more control than bind:value

  	let e = {target: {
  		name: id,
  		value: detail
  	}};

    handleChange(e);
    await tick();
  };

</script>



<style lang="scss" global>

$border-thin: 2px;
$size: 1.2rem;
$height-input: 3rem; //inherit; // coeur sets a height limit on inputs, but we don't want that here
$radius: 0.375rem;
$font-small: 0.825rem;



.Tiptap {

  border: $border-thin solid transparent;

  &.focus-within {
    &:focus-within {
      border: $border-thin solid rgb(59 130 246);
      background: white;
    }
  }

  .Tiptap-editor.editor {
    max-width: 100%;
  }

}

.tiptap_tall {
  .ProseMirror {
    min-height: $size * 1.2; // more focus area
  }
}

.tiptap_serif {
  .element-wrapper {
    // @extend ._font-serif;
    &, * {
      @apply font-serif;
    }

    p:last-of-type {
      padding-bottom: 0;
    }
  }
}

// for the tiptap entry box for title
.tiptap_headline {
  .ProseMirror {
    min-height: $size * 2;
  }

  .element-wrapper {
    &,
    * {
      font-size: $size * 2;
      line-height: $size * 2 * 1.31;
    }
  }
}
</style>