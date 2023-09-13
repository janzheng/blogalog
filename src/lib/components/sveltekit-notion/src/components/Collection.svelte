<!-- 

  Tables need to generally be side loaded unless we traverse all nodes and download all the pages
  but that usually ends up in tons of data, so we generally don't want to do that

 -->

<script>
	import { browser } from '$app/environment';
  
  import CollectionTable from "../subcomponents/CollectionTable.svelte";
  import CollectionGallery from "../subcomponents/CollectionGallery.svelte";
  import CollectionList from "../subcomponents/CollectionList.svelte";
  import CollectionBoard from "../subcomponents/CollectionBoard.svelte";

  export let block = {};
  export let blocks;
  export let api;
  export let doExternalRequest = true;
  export let tableData = null;
  export let view, isHideTitle, _description;
  // export let classes = ''
  // export let columns

  // const request = fetch(`${api}/v1/table/${block.id}`)
  let request;
  let url, filename, tableRows;

  // if(blocks) {
    // future: find the content from blocks
    // if(blocks.length > 0) {
    //   tableData = blocks.find(block => block.id === block.id);
    // }
    // console.log('[Collection] table data:', tableData, 'blocks:', blocks, 'base id:', block.id)
  // }

  $: if (!tableData && browser && fetch && doExternalRequest) {
    try {
      // console.log('[Collection] fetching Table', tableData, block.id);
      request = fetch(`${api}/v1/collection/${block.id}`)
        .then((res) => res.json())
        .then((json) => {
          tableData = json;
          // console.log('children:', tableData)
          // console.log('collection:', block, tableData, columns)
          return json;
        });
    } catch (e) {
      console.error("[Collection] fetch error", e);
    }
  }


  $: if (tableData && tableData.views) {
    // console.log('tableData:::', tableData)
    view = tableData.views[0];
    // console.log('VIEW:::: //tdata', view, tableData.views, tableData)

    if(tableData.rows) {
      // manipulate data here, e.g. sorting, filtering, insertions

      /* 
        property_filters: [{
          filter: {
            property: "title"
            filter: {
              operator: "string_contains"
              value: {
                type: "exact",
                value: "Banana"
              }
            }
          }
        }]
      */
      let filterObj = view.format?.property_filters?.[0]?.filter
      
      tableRows = tableData.rows;
      
      // console.log('lol:', filterObj)
      if(filterObj) {
        tableRows = tableData.rows.filter(row => {
          // Check if the row value matches the filter value
          // console.log('ok so...', filterObj.filter?.value?.type, filterObj.property, row, row[tableData.schema[filterObj.property].name], filterObj?.filter?.value?.value)
          if(filterObj.filter?.value?.type === 'exact')
            return row[tableData.schema[filterObj.property].name] === filterObj?.filter?.value?.value;
        });
      }

    }
    // console.log('VIEW:::: //tdata FILTER', tableRows)
  }

  // #hide_title : don't show the collection name / title
  $: if (
    tableData &&
    tableData?.collection?.value?.description &&
    tableData?.collection?.value?.description?.[0]
  ) {
    _description =
      tableData.collection.value.description &&
      tableData.collection.value.description[0][0];
    isHideTitle = _description.includes("#hide_title");
  }

</script>

<style>
</style>

{#if false}
  <slot />
{/if}

{#if tableData && tableData.name}
  <div class="notion-collection" id={tableData.name}>
    {#if !isHideTitle}
      <h3 class="notion-collection-header">{tableData.name}</h3>
    {/if}
    <figure class="notion-collection-figure">
      {#if view.type == 'table'}
        <CollectionTable {tableData} {tableRows} {api} {view} />
      {:else if view.type == 'gallery'}
        <CollectionGallery {tableData} {tableRows} {api} {view} />
      {:else if view.type == 'list'}
        <CollectionList {tableData} {tableRows} {api} {view} />
      {:else if view.type == 'board'}
        <CollectionBoard {tableData} {tableRows} {api} {view} />
      {:else}
        <div class="notion-collection-unsupported">
          <!-- Not supported -->
        </div>
      {/if}
    </figure>
  </div>
{/if}
