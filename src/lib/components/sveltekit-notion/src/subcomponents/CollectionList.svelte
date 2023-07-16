<script>
  /* 
    Special Galleries: add these flags to the collection description

    #links: This is DEFAULT behavior! Not needed 
      used for lists of links, where clicking entire row opens up the URL
      - Name - (optional) - Title used as caption
      - [Url] - URL links the image to another location
  
  
  */
  import CollectionProp from "../subcomponents/CollectionProp.svelte";

  export let api,
    tableData = null,
    tableRows,
    view;

  let _format = view.format,
    _props;

  // these strings are weird and have some hidden properties; this erases them
  let _description, isLinks;

  // $: if(tableData && tableData.collection.value.description && tableData.collection.value.description[0]) {
  //   _description = tableData.collection.value.description && tableData.collection.value.description[0][0]
  //   isLinks = _description.includes('#links')
  // }

  $: if (_format) {
    _props = _format.list_properties;
  }

  // $: console.log('gallery:', tableData.name, ' ::: ', tableRows, 'view:', view, )

  // properly orients and filters based on gallery view
  export const getRecordItems = (card) => {
    let recordItem = [];

    _props.map((p) => {
      if (p.visible) {
        let schema = tableData.schema[p.property];
        let colName = schema.name;
        // recordItem.push({...card, schema: tableData.schema[p.property]})
        recordItem.push({ value: card[colName], schema });
      }
    });
    return recordItem;
  };

</script>

<div class="notion-collection-list ">
  {#each tableRows as record}
    {#if record.URL}
      <div class="notion-item">
        <a
          rel="external noreferrer"
          href={record.URL}
          target="_blank"
          class="notion-list-link">
          <span class="notion-collection-item">
            <span class="notion-collection-name">
              <span class="notion-inline-title">{record.Name}</span>
            </span>
            <span class="notion-collection-props">
              {#each getRecordItems(record) as item}
                <span class="notion-item">
                  <CollectionProp
                    fieldItem={item.value}
                    {tableData}
                    {api}
                    {record}
                    schema={item.schema} />
                </span>
              {/each}
            </span>
          </span>
        </a>
      </div>
    {:else}
      <div class="notion-collection-item">
        <div class="notion-collection-name">
          <span class="notion-inline-title">{record.Name}</span>
        </div>
        <div class="notion-collection-props">
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
