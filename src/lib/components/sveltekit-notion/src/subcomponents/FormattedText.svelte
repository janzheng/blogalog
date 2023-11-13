<!-- everything is formatted ugly like this to preserve whitespace -->
{#if false}
    <slot />
{/if}{#if block.properties && block.properties.title}
    {@html formatText(block.properties.title)}
{:else if block.properties && block.properties.caption}
    {@html formatText(block.properties.caption)}
{:else}
    <div class="notion-blank" />
{/if}

<script context="module">
  export const formatText = property => {
    if(property && property.length > 0) {
      let text = property.map(text =>
        text[1]
          ? text[1].reduceRight(
            (av, cv) =>
              ({
                i: `<em>${av}</em>`,
                c: `<code class="notion-inline-code">${av}</code>`,
                s: `<s>${av}</s>`,
                b: `<b>${av}</b>`,
                h: `<span class="notion-${cv[1]}">${av}</span>`,
                a: `<a class="notion-link" href="${cv[1]}">${av}</a>`,
              }[cv[0]]),
            text[0]
            )
          : text[0]
      ).join('')


      if(browser) {
        // makes for faster loads if the same origin
        text = text.replace(/window.location.origin/g, '');
      }
      return text
    }
  };

  export const textToHtml = text =>
    {
      let data = text[1] ? text[1].reduceRight(
        (av, cv) =>
          ({
            i: `<em>${av}</em>`,
            c: `<code class="notion-inline-code">${av}</code>`,
            s: `<s>${av}</s>`,
            b: `<b>${av}</b>`,
            h: `<span class="notion-${cv[1]}">${av}</span>`,
            a: `<a class="notion-link" href="${cv[1]}">${av}</a>`,
          }[cv[0]]),
        text[0]
        )
      : text[0];
      if(browser) {
        // makes for faster loads if the same origin
        data = data.replace(/window.location.origin/g, '');
      }
      return data
    };
</script>

<script>
  import { browser } from '$app/environment';

  export let block = {}
  export let blocks = []; blocks;
  export let api = null; api

</script>
