<script>
	import { browser } from '$app/environment';
  import { toNotionImageUrl } from "../utils.js";
  import FormattedText from "../subcomponents/FormattedText.svelte";

  export let block = {};
  export let blocks = []; blocks;
  export let fullPage = false; fullPage;
  export let api = null; api;
  export let siteSrc; siteSrc;

  const format = block.format ? block.format : null;
  let { block_height, block_width, display_source } = format ? format : {};
  let frame,
    // frame_height = (block_height / block_width) * 100 + '%' // doesn't seem to work well for forms in mobile / narrow views
    frame_height = block_height + "px";

  // if embedded sends a postMessage for height, use that
  if (browser) {
    window.addEventListener(
      "message",
      (event) => {
        // console.log('event????:', event.origin, display_source, display_source.includes(event.origin), event.data, event.data[1])
        if (display_source.includes(event.origin)) {
          // make sure it's the embedded site's event
          // get an array of [outerW, outerH, clientW, clientH]
          // console.log('event:', event.origin, display_source, event.data, event.data[1])
          if (Array.isArray(event.data) && event.data[3])
            frame_height = event.data[3] + "px"; // event.data[1] / event.data[0] * 100
        }
        // event.data should be
      },
      false
    );
  }

  const alt =
    block.properties && block.properties.caption
      ? block.properties.caption[0][0]
      : "";

  let src =
    block.properties && block.properties.source
      ? toNotionImageUrl(block.properties.source[0][0], block.id, siteSrc)
      : block.properties.source[0][0];

  let url, filename;

  if (block.properties && block.properties.source && block.type == "file") {
    url = new URL(block.properties.source[0][0]);
    let skip = "/secure.notion-static.com/";
    filename = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
  }

  if (!display_source && browser) {
    get();
  }

  // embed is a file, not an image
  async function get() {
    const request = fetch(
      `${api}/v1/asset?url=${block.properties.source[0][0]}&blockId=${block.id}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json["signedUrls"] && json["signedUrls"][0])
          display_source = json["signedUrls"][0];
        // console.log("src url:", url, filename);
        return json;
      });
  }

  // console.log('src:', src)

</script>

{#if false}
  <slot />
{/if}

{#if block.type == 'file'}
  <div
    id={`_block-${block.id}`}
    class="notion-file"
    style={`padding-bottom: ${(block_height / block_width) * 100}%; position: relative`}>
    <!-- <iframe class="notion-image-inset" src={display_source} title={alt} /> -->
    <a href={display_source} alt="download file">{filename}</a>
  </div>
{:else}
  <figure
    id={`_block-${block.id}`}
    class="notion-asset-wrapper notion-embed"
    style={`width: ${block_width}px`}>
    <!-- <div style={`padding-bottom: ${(block_height / block_width) * 100}%; position: relative`}> -->
    <div style={`padding-bottom: ${frame_height}; position: relative`}>
      <iframe
        bind:this={frame}
        class="notion-image-inset"
        src={display_source}
        title={alt} />
    </div>
    {#if block.properties.caption}
      <figcaption class="notion-image-caption">
        <FormattedText {block} />
      </figcaption>
    {/if}
  </figure>
{/if}
