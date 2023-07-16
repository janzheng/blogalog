<div id={`_block-${block.id}`} class="notion-column" style={`width: ${width}`}>
    <slot />
</div>
<div class="notion-spacer" style={`width: var(--column-spacing)`} />

<script>
    export let block = {}; block;
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api; api;

    // const spacerWidth = 46
    // const ratio = block.format ? block.format.column_ratio : null
    // const columns = Number((1 / ratio).toFixed(0))
    // const spacerTotalWidth = (columns - 1) * spacerWidth
    // const width = `calc((100% - ${spacerTotalWidth}px) * ${ratio})`

    const spacerWidth = 46
    const ratio = block.format ? block.format.column_ratio : 1
    const columns = Number((1 / ratio).toFixed(0))
    // const spacerTotalWidth = (columns - 1) * spacerWidth
    const width = `calc((100% - var(--column-spacing)) * ${ratio})`

</script>
