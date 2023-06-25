<script>
	import { toggleBold, toggleItalic, toggleStrike } from './buttonActions.js';
	import Button from './Button.svelte';
	
  export let editor;
</script>

{#if editor}
<div class="bubble-menu">
	<Button {editor} key="bold" on:click={() => toggleBold(editor)} />
	<Button {editor} key="italic" on:click={() => toggleItalic(editor)} />
	<Button {editor} key="strike" on:click={() => toggleStrike(editor)} />
</div>
{/if}
