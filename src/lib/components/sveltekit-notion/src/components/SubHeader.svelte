{#if false}
    <slot />
{/if}
<!-- <h3 id={`_block-${block.id}`} class="notion-h3">
    <FormattedText {block} />
</h3> -->
<!-- becomes semantically correct in pages -->
<h3 id={`_block-${block.id}`} class="notion-h2">
    <FormattedText {block} />
</h3>

<script>
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = null; fullPage;
    export let api = null; api;

</script>
