<div id={`_block-${block.id}`} class="notion-row">
    <slot />
</div>

<script>
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api = null; api;

</script>
