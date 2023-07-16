{#if false}
    <slot />
{/if}
<figure
    id={`_block-${block.id}`}
    class="notion-asset-wrapper"
    style={`width: ${block_width}px`}>
    <div
        style={`padding-bottom: ${block_aspect_ratio * 100}%; position: relative`}>
        <iframe class="notion-image-inset" src={display_source} title={alt} />
    </div>
    {#if block.properties.caption}
        <figcaption class="notion-image-caption">
            <FormattedText {block} />
        </figcaption>
    {/if}
</figure>

<script>
    import { toNotionImageUrl } from '../utils.js'
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = null; fullPage;
    export let api = null; api;

    const format = block.format ? block.format : null
    const { block_aspect_ratio, block_width, display_source } = format
        ? format
        : {}
    const alt = block.properties.caption ? block.properties.caption[0][0] : ''
    const src = block.properties.source
        ? toNotionImageUrl(block.properties.source[0][0], block.id)
        : ''

</script>
