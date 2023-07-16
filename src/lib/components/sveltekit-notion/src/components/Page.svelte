<!-- block.permissions aren't set unless you manually toggle it, which is SUPER annoying
     this old one will show empty pages that don't automatically have permissions set
     otherwise it shows it as a listed page w/ icon, which isn't usually handy
 -->
<!-- {#if block.permissions}
    {#if fullPage}
        {#if block.properties}
            <div id={`_block-${block.id}`} class="notion">
                {#if page_cover}
                    <img
                        src={toNotionImageUrl(page_cover, block.id)}
                        alt={getTextContent(block)}
                        class="notion-page-cover"
                        style={`object-position: center ${coverPosition}%`} />
                {/if}
                <div
                    class={`notion-page ${!page_cover && 'notion-page-offset'} ${page_full_width && 'notion-full-width'} ${page_small_text && 'notion-small-text'}`}>
                    {#if page_icon}
                        <PageIcon
                            class={page_cover ? 'notion-page-icon-offset' : undefined}
                            {block}
                            big />
                    {/if}
                    <div class="notion-title">
                        <FormattedText {block} />
                    </div>
                    <slot />
                </div>
            </div>
        {/if}
    {:else}
        <div id={`_block-${block.id}`} class="notion">
            <slot />
        </div>
    {/if}
{:else if block.properties}
    <a id={`_block-${block.id}`} class="notion-page-link" href={`/${block.id}`}>
        {#if block.format}
            <div class="notion-page-icon">
                <PageIcon {block} />
            </div>
        {/if}
        <div class="notion-page-text">
            <FormattedText {block} />
        </div>
    </a>
{/if} -->

<!-- 
    in this version we say screw permissions checking. Makes the pages easier to display (but might screw up if no permissions),
    also the original list of pages doesn't work here
 -->
{#if fullPage}
    {#if block.properties}
        <div id={`_block-${block.id}`} class="notion-page">
            {#if page_cover}
                <img
                    src={toNotionImageUrl(page_cover, block.id)}
                    alt={getTextContent(block)}
                    class="notion-page-cover"
                    style={`object-position: center ${coverPosition}%`} />
            {/if}
            <div
                class={`notion-page ${!page_cover && 'notion-page-offset'} ${page_full_width && 'notion-full-width'} ${page_small_text && 'notion-small-text'}`}>
                {#if page_icon}
                    <PageIcon
                        class={page_cover ? 'notion-page-icon-offset' : undefined}
                        {block}
                        big />
                {/if}
                <div class="notion-title">
                    <FormattedText {block} />
                </div>
                <slot />
            </div>
        </div>
    {/if}
{:else}
    <div id={`_block-${block.id}`} class="notion-page">
        <slot />
    </div>
{/if}

<script>
    import { getTextContent, toNotionImageUrl } from '../utils.js'
    import FormattedText from '../subcomponents/FormattedText.svelte'
    import PageIcon from '../subcomponents/PageIcon.svelte'

    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api = undefined; api;

    const {
        page_icon,
        page_cover,
        page_cover_position,
        page_full_width,
        page_small_text,
    } = block.format ? block.format : {}

    const coverPosition = (1 - (page_cover_position || 0.5)) * 100

</script>
