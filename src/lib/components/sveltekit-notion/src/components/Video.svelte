{#if false}
  <slot />
{/if}

<figure
    id={`_block-${block.id}`}
    bind:clientWidth={width}
    class="notion-asset-wrapper notion-video {block_width > width ? 'notion-image-fullwidth' : ''}"
    style={`width: 100%; max-width: ${block_width}px`}>
    <!-- <div style={`padding-bottom: ${block_aspect_ratio * 100}%; position: relative`}> -->
    <div style="position: relative">
      {#if videoType == 'iframe'}
        <iframe class="notion-image-inset" src={src} title={alt} style="min-height: 360px"/>
      {:else}
        <video width="640" height="360" controls>
          <source src="{src}">
          Your browser does not support the video tag.
        </video>
      {/if}
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
    export let siteSrc; siteSrc;
    export let videoType = null; videoType;

    const format = block.format ? block.format : null;


    const { block_aspect_ratio, block_width, display_source } = format
        ? format
        : {};
    const alt = block.properties.caption ? block.properties.caption[0][0] : '';
    // const src = block.properties.source
    //     ? toNotionImageUrl(block.properties.source[0][0], block.id, siteSrc)
    //     : '';
    let src = block.properties.source
        ? block.properties.source[0][0]
        : '';
        
    if (src.includes('youtube.com/watch') || src.includes('youtu.be')) {
      videoType = 'iframe'
      if (src.includes('youtube.com/watch')) {
        src = src.replace('youtube.com/watch?v=', 'youtube.com/embed/');
      } else if (src.includes('youtu.be')) {
        let videoId = src.split('youtu.be/')[1];
        src = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // $: console.log('video.svelte:', siteSrc, block, src);
    let width
</script>
