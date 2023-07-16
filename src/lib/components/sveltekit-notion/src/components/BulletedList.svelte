{#if isTopLevel(block, blocks)}
    <ul id={`_block-${block.id}`} class="notion-list notion-list-disc">
        {#if block.properties}
            <li>
                <FormattedText {block} />
            </li>
        {/if}
        {#if block.content}
            <ul class="notion-list notion-list-disc">
                <slot />
            </ul>
        {/if}
    </ul>
{:else}
    {#if block.properties}
        <li id={`_block-${block.id}`}>
            <FormattedText {block} />
        </li>
    {/if}
    {#if block.content}
        <ul id={`_block-${block.id}`} class="notion-list notion-list-disc">
            <slot />
        </ul>
    {/if}
{/if}

<script>
    import { isTopLevel, search } from '../utils.js'
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api = null; api;

</script>
