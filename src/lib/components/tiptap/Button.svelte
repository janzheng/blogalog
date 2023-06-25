<script>
  export let editor;
	export let key;
</script>

{#if editor}
  <!-- <button class:active={editor.isActive(key)} on:click|preventDefault|stopPropagation|self> -->
  <button type="button" class:active={editor.isActive(key)} on:click|preventDefault>
    <slot>{key}</slot>
  </button>
{/if}

<style lang="postcss">

  .Tiptap-editor {
    button {
      @apply border-2 bg-gray-100 border-gray-100 rounded-sm hover:border-gray-300;
    }
  }


	button {
    margin: 0;

    @apply p-1 border-2 bg-gray-100 border-gray-100 rounded-sm hover:border-gray-300;


    &.active {
      border-color: rgb(7, 75, 121);
    }
	}
	
</style>