<script>
  import { createEventDispatcher } from 'svelte';

  import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Superscript from '@tiptap/extension-superscript';
	import Subscript from '@tiptap/extension-subscript';
	import Underline from '@tiptap/extension-underline';
	import CharacterCount from '@tiptap/extension-character-count';
	import Placeholder from '@tiptap/extension-placeholder';
  
  // import Link from '@tiptap/extension-link'


  // custom
	import Greek from './greek.js';
	// import smilieReplacer from './smile.js';
 

	const dispatch = createEventDispatcher();
	// import BubbleMenu from '@tiptap/extension-bubble-menu'
	
	// @todo this throws a 'process is not defined' error in the Svelte REPL.
	// Uncomment the next line to see the REPL issue.
	// import BubbleMenu from '@tiptap/extension-bubble-menu'
	import FixedMenu from './FixedMenu.svelte';
	
	export let content = null, html = '', charCount=0, placeholder;
	export let contentStore = writable(content);

	let element;
	let editor;
	let bubbleMenu;

	onMount(() => {
    html = content
    editor = new Editor({
      element,
			extensions: [
        StarterKit,
        Superscript,
        Subscript,
        Underline,
        Greek,
        CharacterCount,
        // Link,
        // smilieReplacer

        Placeholder.configure({
          emptyEditorClass: 'is-editor-empty',
          emptyNodeClass: 'is-empty',
          placeholder: placeholder || 'Write something…',
          // // emptyNodeText: node => {
          // //   return 'Write something'
          // // },
          // showOnlyWhenEditable: true,
          // showOnlyCurrent: true,
        }),
      ],
			content: content,
			onTransaction: () => {
        editor = editor;
			},
		});
		editor.on('update', ({ editor }) => {
      html = editor.getHTML()
      charCount = editor.getCharacterCount()
			contentStore.set(editor.getHTML());
		});
		editor.on('blur', ({ editor }) => {
      dispatch('blur', {content: editor.getHTML(), charCount: editor.getCharacterCount()});
		});
		editor.on('submit', ({ editor }) => {
      console.log('tiptap submit')
      // don't do anything
      // dispatch('blur', {content: editor.getHTML(), charCount: editor.getCharacterCount()});
		});

    // init charCount
    charCount = editor.getCharacterCount()
	});

	onDestroy(() => {
    // if(editor)
    //   editor.destroy();
	});
</script>

<div class="Tiptap-editor editor wrapper">
	<FixedMenu {editor} />
	<!-- <BubbleMenu {editor} /> -->
	<div class="element-wrapper" bind:this={element}/>
</div>

<!-- {#if editor}
  <div class="html-output">
    {editor.getHTML()}
  </div>
{/if} -->

<style lang="postcss" global>
	/* .wrapper {
    border: 1px solid #ccc;
		max-height: 200px;
		display: inline-flex;
		flex-direction: column;
	} */
	
	/* .wrapper:focus-within {
    border: 1px solid red;
	} */
	 
	/* .element-wrapper {
    padding: 1rem;
		flex: 1 1 0%;
		resize: both;
		overflow: auto;
	}
	
	.element-wrapper :global(p:first-of-type) {
    margin-top: 0;
	}
	
	.element-wrapper :global(p:last-of-type) {
    margin-bottom: 0;
	}
	
	
  */

	.element-wrapper > :global(.ProseMirror) {
    outline: 0;
	}

  .editor p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
  }
</style>