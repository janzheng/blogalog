{#if false}
    <slot />
{/if}
<blockquote id={`_block-${block.id}`} class="notion-quote">
    <FormattedText {block} />
    <div class="notion-callout-children">
        <slot />
    </div>
</blockquote>

<script>
    import { getTextContent } from '../utils.js'
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api = null; api;

</script>
