<script>
  import { setContext } from "svelte";
  import { getTextContent } from "../utils.js";

  import PageIcon from "../subcomponents/PageIcon.svelte";
  import FormattedText from "../subcomponents/FormattedText.svelte";

  export let block = {};
  export let blocks = []; blocks;
  export let fullPage = false; fullPage;
  export let api = null; api;
  export let classes = "", iconClasses="", showIcon = true, useBlockColor = true, useCallout = true, calloutType = "default";

  let markdown = false, url;

  const title = getTextContent(block);

  $: if (title) {
    // title = block.properties.title // first line of the callout

    // special Callouts
    if (title && title.includes("#billboard") || title.includes("#hideicon")) {
      calloutType = "billboard";
      showIcon = false;
    }

    if (title && title.includes("#noBg")) {
      useBlockColor = false;
    }

    if (title && title.includes("#blank")) {
      useCallout = false;
    }

    if (title && title.includes(".icon-center")) {
      calloutType = "noTitle";
      iconClasses = "icon-center";
    }


    if (title && title.includes("#link")) {
      calloutType = "link";
      showIcon = false;
      useBlockColor = false;
      // we're trying to get the link from something that looks like #link:https://phageaustralia.org/intro
      let hashes = title.split(' ')
      let hash = hashes.find(h => h.includes('link'))
      url = hash.substring(hash.indexOf(':')+1)
    }

    if (title && title.includes("#classes")) {
      classes += " " + title;
    }

    if (title && title.includes("#classes")) {
      classes += " " + title;
    }

    // child blocks can get 'useHtml' context
    if (title && title.includes("#html")) {
      setContext("useHtml", true);
    }
  }

</script>

{#if url}
  <a href={url} class={classes} style="display: inline-block;">
    <div
      id={`_block-${block.id}`}
      class:notion-callout-billboard={title.includes('#billboard')}
      >
      <div class="">
        <div class="">
          <slot />
        </div>
      </div>
    </div>
  </a>


{:else}
  <div
    id={`_block-${block.id}`}
    class:notion-callout-billboard={title.includes('#billboard')}
    class={`${useCallout ? 'notion-callout' : ''} ${classes} ${block.content ? 'notion-children' : ''} ${useBlockColor && block.format.block_color && 'notion-' + block.format.block_color + '_co'}`}>
    {#if showIcon}
      <div class="notion-callout-icon {iconClasses}">
        <PageIcon {block} />
      </div>
    {/if}
    <div class="notion-callout-text">
      {#if calloutType == 'default'}
        <FormattedText {block} />
      {/if}
      <div class="notion-callout-children">
        <slot />
      </div>
    </div>
  </div>
{/if}