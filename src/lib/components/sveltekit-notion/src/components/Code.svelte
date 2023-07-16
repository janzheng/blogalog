{#if false}
    <slot />
{/if}
<pre id={`_block-${block.id}`} class="line-numbers notion-code">
    <code
        bind:this={highlight}
        class={`language-${language.toLowerCase()}`}>
        {code}
    </code>
</pre>

<script>
    import { onMount } from 'svelte'
    import Prism from 'prismjs'
    import 'prism-solarized-dark/prism-solarizeddark.css'
    import 'prismjs/plugins/toolbar/prism-toolbar.min.js'
    import 'prismjs/plugins/toolbar/prism-toolbar.css'
    import 'prismjs/plugins/show-language/prism-show-language.min.js'
    import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
    import 'prismjs/plugins/line-numbers/prism-line-numbers.min.js'
    import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
    import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js'
    import { getTextContent } from '../utils.js'
    export let block = {}; block;
    export let blocks = []; blocks;
    export let fullPage = null; fullPage;
    export let api = null; api;
    let highlight

    const code = getTextContent(block)
    const language = block.properties
        ? block.properties.language[0][0]
        : 'javascript'

    onMount(() => {
        Prism.highlightElement(highlight)
    })

</script>

<style>
    .notion-code {
        padding: 30px 16px 30px 20px;
        margin: 4px 0;
        tab-size: 2;
        font-size: 85%;
        display: block;
        font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier,
            monospace;
        box-sizing: border-box;
        overflow-x: scroll;
    }

</style>
