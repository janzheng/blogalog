<div class="notion-syncedblock">
    {#if block.type == 'transclusion_container'}
        <slot />
    {:else}
        <Render
            id={`_block-${block.id}`}
            {fullPage}
            {blocks}
            {api}
            block={blocks.find(el => el.id == pointer.id)} />
    {/if}
</div>

<script>
    export let block = {}
    export let blocks = []
    export let fullPage = false
    export let api

    import Render from '../subcomponents/Render.svelte'

    let pointer
    if (block.type !== 'transclusion_container') {
        pointer = block.format.transclusion_reference_pointer
    }

</script>

<style>
</style>
