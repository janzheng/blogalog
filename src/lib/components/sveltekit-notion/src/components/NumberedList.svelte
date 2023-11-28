{#if isTopLevel(block, blocks)}
  <ol
    id={`_block-${block.id}`}
    {start}
    class="notion-list notion-list-numbered">
    {#if block.properties}
      <li>
        <FormattedText {block} />
      </li>
    {/if}
    {#if block.content}
      <!-- this is required for nested ordered lists to reset properly; but it was commented out... which means it broke something else -->
      <!-- <ol {start} class="notion-list notion-list-numbered"> -->
      <ol class="notion-list notion-list-numbered">
        <slot />
      </ol>
    {/if}
</ol>
{:else}
  {#if block.properties}
    <li id={`_block-${block.id}`}>
      <FormattedText {block} />
    </li>
  {/if}
  {#if block.content}
    <ol
      id={`_block-${block.id}`}
      {start}
      class="notion-list notion-list-numbered">
      <slot />
    </ol>
  {/if}
{/if}

<script>
  import { getListNumber, isTopLevel, search } from '../utils.js'
  import FormattedText from '../subcomponents/FormattedText.svelte'
  export let block = {}
  export let blocks = []; blocks;
  export let fullPage = false; fullPage;
  export let api = null; api;

  const start = getListNumber(block, blocks);
</script>
