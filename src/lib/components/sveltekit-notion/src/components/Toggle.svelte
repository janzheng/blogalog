<script>
  import { setContext } from "svelte";
  import { getTextContent } from "../utils.js";

  import FormattedText from "../subcomponents/FormattedText.svelte";
  export let block = {};
  export let blocks = []; blocks;
  export let fullPage = null; fullPage;
  export let api = null; api;
  export let useHtml = false,
    isContainer = false;

  const title = getTextContent(block);

  $: if (title) {
    // child blocks can get 'useHtml' context to process html
    if (title && title.includes("#html")) {
      setContext("useHtml", true);
      useHtml = true;
    }

    // treats the callout as a composable container; no toggle, no padding
    if (title && title.includes("#container")) {
      isContainer = true;
    }
  }

</script>

<style>
  summary {
    white-space: nowrap;
    margin-left: 0;
  }

</style>

{#if useHtml}
  <div id={`_block-${block.id}`} class="notion-toggle-html">
    <slot />
  </div>
{:else if isContainer}
  <div id={`_block-${block.id}`} class="notion-toggle-container">
    <slot />
  </div>
{:else}
  <details id={`_block-${block.id}`} class="notion-toggle">
    <summary>
      <span class="notion-toggle-summary"><FormattedText {block} /></span>
    </summary>
    <div class="notion-toggle-children">
      <slot />
    </div>
  </details>
{/if}
