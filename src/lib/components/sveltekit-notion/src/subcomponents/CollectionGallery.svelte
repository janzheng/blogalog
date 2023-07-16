<script>
  /* 
Special Galleries: add these flags to the collection description

#hide_title : don't show the title
#image_links : 
    used for sponsors grid of pictures with a link
    - [File] - first image used as cover
    - [Url] - URL links the image to another location
    - Name - (optional) - Title used as caption


*/
  import { isImage, toNotionImageUrl } from "../utils.js";
  import CollectionProp from "../subcomponents/CollectionProp.svelte";
  import FormattedText from "../subcomponents/FormattedText.svelte";

  export let api,
    tableData = null,
    tableRows,
    view;

  let _format = view.format;
  let _coverType, _coverProperty, _coverAspect, _coverSize, _props;

  // these strings are weird and have some hidden properties this erases them
  let _description, classes, isProfiles, isImageLinks, hideGalleryTitles;

  $: if (
    tableData &&
    tableData.collection.value.description &&
    tableData.collection.value.description[0]
  ) {
    _description =
      tableData.collection.value.description &&
      tableData.collection.value.description[0][0];

    if (_description.includes("#classes")) {
      classes += " " + _description;
    }

    isProfiles = _description.includes("#profiles");
    isImageLinks = _description.includes("#image_links");
    hideGalleryTitles = _description.includes("#hide_gallery_titles"); // hides gallery titles
  }

  $: if (view) {
    _coverType = _format.gallery_cover && _format.gallery_cover.type;
    _coverProperty = _format.gallery_cover && _format.gallery_cover.property;
    _coverAspect =
      (_format.gallery_cover && _format.gallery_cover_aspect) || "contain";
    _coverSize = _format.gallery_cover_size || "medium";
    _props = _format.gallery_properties;
  }

  // $: console.log('gallery:', tableData.name, ' ::: ', tableRows, 'view:', view, )

  // properly orients and filters based on gallery view
  export const getRecordItems = (card, skip = []) => {
    let recordItem = [];

    _props.map((p) => {
      if (p.visible) {
        let schema = tableData.schema[p.property];
        let colName = schema.name;
        // recordItem.push({...card, schema: tableData.schema[p.property]})
        if (!skip.includes(colName))
          recordItem.push({ value: card[colName], schema });
      }
    });
    return recordItem;
  };

  export const getCover = (card) => {
    let cover;

    if (_coverType && _coverType == "property") {
      let colName = tableData.schema[_coverProperty].name;
      cover = card[colName] && card[colName].length > 0 ? card[colName][0] : "";
    } else if (_coverType && _coverType == "page_cover") {
      cover = {
        url:
          card.format &&
          card.format.page_cover &&
          toNotionImageUrl(card.format.page_cover, card.id),
      };
    }

    return cover;
  };

</script>

<div
  class:isProfiles
  class="notion-collection-gallery {classes} notion-galleryboard-{_coverType} notion-galleryboard-{_coverSize} notion-galleryboard-{_coverAspect}">
  {#each tableRows as record}
    {#if isImageLinks}
      <div class="notion-galleryboard-item notion-galleryboard-imagelinks">
        {#if _format.gallery_cover}
          <div class="notion-galleryboard-cover">
            {#if getCover(record)}
              {#if record['URL']}
                <a sapper:prefetch href={record['URL']}>
                  <img
                    style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                    alt={getCover(record).name}
                    src={getCover(record).url} />
                  {#if record['Name'] && !hideGalleryTitles}
                    {record['Name']}
                  {/if}
                </a>
              {:else}
                <img
                  style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                  alt={getCover(record).name}
                  src={getCover(record).url} />
                {#if record['Name'] && !hideGalleryTitles}{record['Name']}{/if}
              {/if}
              <div class="notion-galleryboard-description">
                {#each getRecordItems(record, ['Name']) as item}
                  <div class="notion-item">
                    <CollectionProp
                      fieldItem={item.value}
                      {tableData}
                      {api}
                      {record}
                      schema={item.schema} />
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {:else if isProfiles}
      <div class="notion-galleryboard-item notion-galleryboard-profile">
        {#if _format.gallery_cover}
          <div class="notion-galleryboard-cover">
            {#if getCover(record)}
              {#if record['URL']}
                <a sapper:prefetch href={record['URL']}>
                  <img
                    style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                    alt={getCover(record).name}
                    src={getCover(record).url} />
                </a>
              {:else}
                <img
                  style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                  alt={getCover(record).name}
                  src={getCover(record).url} />
              {/if}
            {/if}
          </div>
        {/if}
        <div class="notion-galleryboard-description">
          {#if record['URL']}
            <a
              class="notion-galleryboard-name"
              sapper:prefetch
              href={record['URL']}>
              {#if record['Name'] && !hideGalleryTitles}{record['Name']}{/if}
            </a>
          {:else if record['Name'] && !hideGalleryTitles}
            <span class="notion-galleryboard-name">{record['Name']}</span>
          {/if}
          {#each getRecordItems(record, ['Name']) as item}
            <div class="notion-item">
              <CollectionProp
                fieldItem={item.value}
                {tableData}
                {api}
                {record}
                schema={item.schema} />
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="notion-galleryboard-item">
        {#if _format.gallery_cover}
          <div class="notion-galleryboard-cover">
            {#if record['URL']}
              <a sapper:prefetch href={record['URL']}>
                <img
                  style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                  alt={getCover(record).name}
                  src={getCover(record).url} />
              </a>
            {:else}
              <img
                style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                alt={getCover(record).name}
                src={getCover(record).url} />
              {#if record['Name'] && !hideGalleryTitles}{record['Name']}{/if}
            {/if}
          </div>
        {/if}
        <div class="notion-galleryboard-props">
          {#each getRecordItems(record) as item}
            <div class="notion-item">
              <CollectionProp
                fieldItem={item.value}
                {tableData}
                {api}
                {record}
                schema={item.schema} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>
