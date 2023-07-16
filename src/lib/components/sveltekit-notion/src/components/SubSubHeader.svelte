{#if false}
    <slot />
{/if}
<h4 id={`_block-${block.id}`} class="notion-h3">
    <FormattedText {block} />
</h4>

<script>
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = null; fullPage;
    export let api = null; api;

</script>
