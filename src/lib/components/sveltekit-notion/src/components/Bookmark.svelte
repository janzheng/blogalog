{#if false}
    <slot />
{/if}
{#if block.format}
    <div id={`_block-${block.id}`} class="notion-row">
        <a
            target="_blank"
            rel="noopener noreferrer"
            class={`notion-bookmark ${block.format.block_color && 'notion-' + block.format.block_color}`}
            href={block.properties.link[0][0]}>
            <div>
                <div class="notion-bookmark-title">
                    <FormattedText {block} />
                </div>
                <div class="notion-bookmark-description">
                    {formatText(block.properties.description)}
                </div>
                <div class="notion-bookmark-link">
                    <img
                        src={toNotionImageUrl(block.format.bookmark_icon, block.id, siteSrc)}
                        alt={getTextContent(block)} />
                    <div>{formatText(block.properties.link)}</div>
                </div>
            </div>
            <div class="notion-bookmark-image">
                <img
                    src={toNotionImageUrl(block.format.bookmark_cover, block.id, siteSrc)}
                    alt={getTextContent(block)} />
            </div>
        </a>
    </div>
{/if}

<script>
    import { getTextContent, toNotionImageUrl } from '../utils.js'
    import FormattedText, {
        formatText,
    } from '../subcomponents/FormattedText.svelte'


    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api; api;
    export let siteSrc; siteSrc;

</script>
