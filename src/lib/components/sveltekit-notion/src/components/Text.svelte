<script>
  import { getContext } from "svelte";
  import { getTextContent } from "../utils.js";

  import FormattedText from "../subcomponents/FormattedText.svelte";
  export let block = {};

  export let api = null; api;
  export let blocks = []; blocks;
  export let fullPage = null; fullPage;
  export let markdown = false; markdown;

  let useHtml = getContext("useHtml") || false;

</script>

{#if false}
  <slot />
{/if}
{#if block.properties && block.properties.title}
  {#if useHtml}
    <div id={`_block-${block.id}`} class="notion-text-html">
      {@html getTextContent(block)}
    </div>
  {:else}
    <p id={`_block-${block.id}`} class="notion-text">
      <FormattedText {block} />
    </p>
  {/if}
{:else if block.properties && block.properties.caption}
  <span id={`_block-${block.id}`} class="notion-text">
    <FormattedText {block} />
  </span>
{:else}
  <div id={`_block-${block.id}`} class="notion-blank" />
{/if}
