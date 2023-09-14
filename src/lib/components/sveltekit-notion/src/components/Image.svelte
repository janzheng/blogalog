{#if false}
    <slot />
{/if}

{#if format}
    <figure
        bind:clientWidth={width}
        id={`_block-${block.id}`}
        class="notion-asset-wrapper notion-image {block_width > width ? 'notion-image-fullwidth' : ''}"
        style={`width: 100%; max-width: ${block_width}px`}>
        {#if block_aspect_ratio}
          <!-- <div style={`padding-bottom: ${block_aspect_ratio * 100}%`}> -->
            <img class="notion-image-inset " {alt} {src} loading="lazy" />
          <!-- </div> -->
        {:else}<img {alt} {src} loading="lazy" />{/if}
        {#if block.properties.caption}
            <figcaption class="notion-image-caption">
              <FormattedText {block} />
            </figcaption>
        {/if}
    </figure>
{/if}

<script>
    import { getTextContent, toNotionImageUrl } from '../utils.js'
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}; block;
    export let blocks = []; blocks;
    export let fullPage = false; fullPage;
    export let api = null; api;
    export let siteSrc; siteSrc;

    if(block.properties.title)
      block.properties.title = null; // notion sometimes adds "untitled" as the title, which we don't need
    const format = block.format ? block.format : null
    const { block_aspect_ratio, block_width } = format ? format : {}
    const alt = block.properties.caption ? block.properties.caption[0][0] : ''
    let src = getNotionImageLink(block.format?.display_source) || // this one displays the raw link to a linked image
        (block.properties.source ? toNotionImageUrl(block.properties.source[0][0], block.id, siteSrc) : '')

    let width
    // $: if(width) console.log('block:', width, block)



  export function getNotionImageLink(imageUrl) {
    /* 
      we want rawUrl whenever possible, EXCEPT when it contains "https://prod-files-secure.s3" which doesn't render properly
    */
  if(!imageUrl) return null
  
    let url // = notionImage?.Content // defunct; images should be in .Cover or other explicit URL fields! Many items use .Content for text

    // console.log('fileObj:',fileObj)
    const links = ["https://prod-files-secure.s3", "//s3-us-west-2.amazonaws"];
    if (!url) url = links.some(link => imageUrl?.includes(link)) ? null : imageUrl;
    return url
  }

</script>

<style>
    figure div {
        position: relative;
    }

</style>
