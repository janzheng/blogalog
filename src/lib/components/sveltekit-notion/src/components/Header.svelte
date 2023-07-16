{#if false}
    <slot />
{/if}
<!-- <h1 id={`_block-${block.id}`} class="notion-h1">
    <FormattedText {block} />
</h1> -->
<!-- becomes semantically correct in pages -->
<h2 id={`_block-${block.id}`} class="notion-h1">
    <FormattedText {block} />
</h2>

<script>
    import FormattedText from '../subcomponents/FormattedText.svelte'

    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api = null; api;

</script>
