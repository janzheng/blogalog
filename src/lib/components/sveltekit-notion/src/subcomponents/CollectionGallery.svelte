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
  import GalleryItem from "../subcomponents/CollectionGalleryItem.svelte";

  export let api,
    tableData = null,
    tableRows,
    view;

  let _format = view.format;
  let _coverType, _coverProperty, _coverAspect, _coverSize, _props, collectionGroups;

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
    // hideGalleryTitles = _description.includes("#hide_gallery_titles"); // hides gallery titles
    hideGalleryTitles = false
  }

  $: if (view) {
    _coverType = _format.gallery_cover && _format.gallery_cover.type;
    _coverProperty = _format.gallery_cover && _format.gallery_cover.property;
    _coverAspect =
      (_format.gallery_cover && _format.gallery_cover_aspect) || "contain";
    _coverSize = _format.gallery_cover_size || "medium";
    _props = _format.gallery_properties;
    collectionGroups = _format.collection_groups.filter((g) => !g.hidden).map(g => ({
      "value": g.value?.value?.value, 
      "property": g.property,
      "key": view?.format?.table_properties?.find(p => p?.property == g?.property)?.name
    }));

    if(collectionGroups && collectionGroups.length>0) {
      // if the collection is in groups, we reorganize tableRows according to the groups and format.table_properties
      let orderedTableRows = [];
      collectionGroups.forEach(group => {
        let groupRows = tableRows.filter(row => row[group.key] === group.value);
        orderedTableRows = [...orderedTableRows, ...groupRows];
      });
      tableRows = orderedTableRows;
    }
  }

  // $: console.log('gallery:', tableData.name, ' ::: ', tableRows, 'view:', view, 'props:', _props, '_collectionGroups:', collectionGroups)

  // properly orients and filters based on gallery view
  export const getRecordItems = (card, skip = []) => {
    let recordItem = [];

    _props?.map((p) => {
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
  {#if collectionGroups}
    {#each collectionGroups as group}
      <div class="notion-collection-gallery-group">
        <h4 class="notion-collection-gallery-group-header">{group.value}</h4>
        <div class="notion-collection-gallery-group-items">
          {#each tableRows.filter(r=>r[group.key] == group.value) as record}
            <GalleryItem 
              isImageLinks={isImageLinks}
              _format={_format}
              getCover={getCover}
              record={record}
              _coverAspect={_coverAspect}
              hideGalleryTitles={hideGalleryTitles}
              CollectionProp={CollectionProp}
              isProfiles={isProfiles}
              getRecordItems={getRecordItems}
              tableData={tableData}
              api={api}
            />
          {/each}  
        </div>
      </div>
    {/each}
  {:else}
    {#each tableRows as record}
      <GalleryItem 
        isImageLinks={isImageLinks}
        _format={_format}
        getCover={getCover}
        record={record}
        _coverAspect={_coverAspect}
        hideGalleryTitles={hideGalleryTitles}
        CollectionProp={CollectionProp}
        isProfiles={isProfiles}
        getRecordItems={getRecordItems}
        tableData={tableData}
        api={api}
      />
    {/each}
  {/if}
</div>
