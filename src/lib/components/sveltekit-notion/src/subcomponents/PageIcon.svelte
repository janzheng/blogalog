{#if isIconBlock(block)}
    {#if icon && icon.includes('http')}
        <img
            class={big ? 'notion-page-icon-cover' : 'notion-page-icon'}
            src={toNotionImageUrl(icon, block.id)}
            alt={title ? getTextContent(title) : 'Icon'} />
    {:else}
        <span
            class={big ? 'notion-page-icon-cover' : 'notion-page-icon'}
            aria-label={icon}>
            {icon}
        </span>
    {/if}
{/if}

<script>
    import { toNotionImageUrl, getTextContent } from '../utils'
    export let block = {}
    export let big = false

    const isIconBlock = value =>
        value.type === 'page' || value.type === 'callout'

    const icon = block.format.page_icon
    const title =
        block.properties && block.properties.title
            ? block.properties.title
            : null

</script>
