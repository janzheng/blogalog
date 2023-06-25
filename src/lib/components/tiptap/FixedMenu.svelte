<script>
  
  import { browser } from '$app/environment';
	import { toggleBold, toggleItalic, toggleStrike, toggleSuperscript, toggleSubscript, toggleUnderline, useGreek } from './buttonActions.js';
	import Button from './Button.svelte';
	
  export let editor;
</script>

{#if editor && browser}
  <div class="fixed-menu mb-4">
    <Button {editor} key="bold" on:click={() => toggleBold(editor)}>
      <div class="icon">
        <svg class="icon__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>text-bold</title><path d="M17.194,10.962A6.271,6.271,0,0,0,12.844.248H4.3a1.25,1.25,0,0,0,0,2.5H5.313a.25.25,0,0,1,.25.25V21a.25.25,0,0,1-.25.25H4.3a1.25,1.25,0,1,0,0,2.5h9.963a6.742,6.742,0,0,0,2.93-12.786Zm-4.35-8.214a3.762,3.762,0,0,1,0,7.523H8.313a.25.25,0,0,1-.25-.25V3a.25.25,0,0,1,.25-.25Zm1.42,18.5H8.313a.25.25,0,0,1-.25-.25V13.021a.25.25,0,0,1,.25-.25h4.531c.017,0,.033,0,.049,0l.013,0h1.358a4.239,4.239,0,0,1,0,8.477Z"/></svg>
      </div>
    </Button>
    <Button {editor} key="italic" on:click={() => toggleItalic(editor)}>
      <div class="icon">
        <svg class="icon__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>text-italic</title><path d="M22.5.248H14.863a1.25,1.25,0,0,0,0,2.5h1.086a.25.25,0,0,1,.211.384L4.78,21.017a.5.5,0,0,1-.422.231H1.5a1.25,1.25,0,0,0,0,2.5H9.137a1.25,1.25,0,0,0,0-2.5H8.051a.25.25,0,0,1-.211-.384L19.22,2.98a.5.5,0,0,1,.422-.232H22.5a1.25,1.25,0,0,0,0-2.5Z"/></svg>
      </div>
    </Button>
    <Button {editor} key="underline" on:click={() => toggleUnderline(editor)}>
      <div class="icon">
        <svg class="icon__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>text-underline</title><path d="M22.5,21.248H1.5a1.25,1.25,0,0,0,0,2.5h21a1.25,1.25,0,0,0,0-2.5Z"/><path d="M1.978,2.748H3.341a.25.25,0,0,1,.25.25v8.523a8.409,8.409,0,0,0,16.818,0V3a.25.25,0,0,1,.25-.25h1.363a1.25,1.25,0,0,0,0-2.5H16.3a1.25,1.25,0,0,0,0,2.5h1.363a.25.25,0,0,1,.25.25v8.523a5.909,5.909,0,0,1-11.818,0V3a.25.25,0,0,1,.25-.25H7.7a1.25,1.25,0,1,0,0-2.5H1.978a1.25,1.25,0,0,0,0,2.5Z"/></svg>
      </div>
    </Button>
    <Button {editor} key="superscript" on:click={() => toggleSuperscript(editor)}>
      x<sup>2</sup>
    </Button>
    <Button {editor} key="subscript" on:click={() => toggleSubscript(editor)}>
      x<sub>2</sub>
    </Button>
    <Button {editor} key="greek" on:click={() => useGreek(editor)}>
      αβφ
    </Button>
  </div>
{/if}

<style lang="postcss">

  .icon {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    width: 0.8rem;
    height: 0.8rem;
    margin: 0 .3rem;
    top: -.05rem;
    fill: currentColor;

    .icon__svg {
      display: inline-block;
      vertical-align: top;
      width: 100%;
      height: 100%;
    }

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }

  }
  
</style>