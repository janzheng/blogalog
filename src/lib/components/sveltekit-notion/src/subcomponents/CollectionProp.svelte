<script>
	import { browser } from '$app/environment';
  import { isImage } from "../utils.js";
  export let fieldItem, api, record, schema;

  // removes lengthy URLs for cleaner look
  const getHostname = (url) => {
    try {
      if (browser) return new URL(url).hostname;
    } catch (e) {
      // local URLs or malformed urls
    }
    return url;
  };

  const getDateTime = (dateObj) => {
    let _date;

    if (fieldItem.type == "date") {
      _date = new Date(dateObj.start_date);
      return _date.toLocaleString("en-US", {
        timeZone: "UTC",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (fieldItem.type == "datetime") {
      _date = new Date(dateObj.start_date + " " + dateObj.start_time);
      let timeZone = dateObj.time_zone || "UTC";
      return _date.toLocaleString("en-US", {
        timeZone,
        dateStyle: "medium",
        timeStyle: "short",
      });
    }

    if (fieldItem.type == "datetimerange") {
      _date = new Date(dateObj.start_date + " " + dateObj.start_time);
      let _end = new Date(dateObj.end_date + " " + dateObj.end_time);
      let timeZone = dateObj.time_zone || "UTC";

      let start = _date.toLocaleString("en-US", {
        timeZone,
        dateStyle: "medium",
        timeStyle: "short",
      });
      let end = _end.toLocaleString("en-US", {
        timeZone,
        dateStyle: "medium",
        timeStyle: "short",
      });
      return `${start} → ${end}`;
    }
  };

</script>

<!--
  renders a collection item's property, like single select, text, and images
  appears in
  - table cell
  - gallery

  future:
  - kanban
-->

{#if fieldItem}
  {#if Array.isArray(fieldItem)}
    {#if typeof fieldItem[0] === 'object'}
      {#each fieldItem as attachment, id}
        {#if isImage(attachment)}
          <!-- images -->
          <a
            href={`${api}/v1/file?url=${attachment.rawUrl}&blockId=${record.id}`}
            target="_blank" rel="external noreferrer">
            <img
              class="notion-collection-image"
              alt={attachment.name}
              src={attachment.url} />
          </a>
        {:else}
          <!-- file attachment -->
          <a
            href={`${api}/v1/file?url=${attachment.rawUrl}&blockId=${record.id}`}
            target="_blank" rel="external noreferrer">{attachment.name}</a>
        {/if}
      {/each}
    {:else}
      <!-- multiple select -->
      {#each fieldItem as tag, tagCounter}
        <span
          class="notion-tag
          notion-{schema.options.find((f) => f.value == tag).color}
          notion-{schema.options.find((f) => f.value == tag).color}_background
          ">{tag}</span>
      {/each}
    {/if}
  {:else}
    <!-- strings and such -->
    {#if schema.type == 'select'}
      <span
        class="notion-tag notion-{schema.options[schema.options.findIndex((f) => f.value == fieldItem)].color} notion-{schema.options[schema.options.findIndex((f) => f.value == fieldItem)].color}_background">{fieldItem}</span>
    {:else if schema.type == 'multi_select'}
      <!-- this happens on boards -->
      <span
        class="notion-tag
        notion-{schema.options.find((f) => f.value == fieldItem).color}
        notion-{schema.options.find((f) => f.value == fieldItem).color}_background
        ">{fieldItem}</span>
    {:else if schema.type == 'url'}
      <!-- <a href={fieldItem} class="notion-link" style="display: inline-block;">{fieldItem}</a> -->
      <a
        href={fieldItem}
        class="notion-link"
        style="display: inline-block;">{getHostname(fieldItem) || fieldItem}</a>
    {:else if schema.type == 'title'}
      <span class="notion-inline-title">{fieldItem}</span>
    {:else if fieldItem.type == 'date'}
      <span class="notion-date">{getDateTime(fieldItem)}</span>
    {:else if fieldItem.type == 'datetime'}
      <span class="notion-datetime">{getDateTime(fieldItem)}</span>
    {:else if fieldItem.type == 'datetimerange'}
      <span class="notion-datetimerange">{getDateTime(fieldItem)}</span>
    {:else}
      {@html fieldItem}
      <!-- {JSON.stringify(fieldItem)} -->
      <!-- {schema.type} -->
    {/if}
  {/if}
  <!-- other cols like users are not supported right now -->
{/if}
