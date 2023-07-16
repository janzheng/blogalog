<!-- <div class="notion-collection-board notion-galleryboard-{_coverSize} notion-galleryboard-{_coverAspect}"> -->
<div
    class="notion-collection-board notion-galleryboard-flex notion-galleryboard-{_coverType} notion-galleryboard-{_coverSize} notion-galleryboard-{_coverAspect}">
    {#each getBoardColumns() as column}
        <div class="notion-galleryboard-column">
            <div class="notion-galleryboard-header notion-item">
                <!-- {JSON.stringify(column.value)} -->
                {#if !column.value.value || column.value.value == ''}
                    <div class="notion-galleryboard-empty" />
                {:else}
                    <CollectionProp
                        fieldItem={column.value.value}
                        {tableData}
                        {api}
                        record={null}
                        schema={column.schema} />
                {/if}
            </div>
            <div class="notion-galleryboard-items">
                {#each getColumnRecords(column) as record}
                    <!-- {JSON.stringify(record)} -->
                    <!-- <CollectionProp fieldItem={column.value.value} {tableData} {api} record={null} schema={column.schema} /> -->
                    <div class="notion-galleryboard-item">
                        {#if _coverType && getCover(record).url}
                            <div class="notion-galleryboard-cover">
                                {#if getCover(record).url}
                                    <img
                                        style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                                        alt={getCover(record).name}
                                        src={getCover(record).url} />
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
                {/each}
            </div>
        </div>
    {/each}
</div>

<script>
    /* 
    Special Galleries: add these flags to the collection description

    #groups: responsive blocks/groups of cards, rather than horizontally scrolling
    #links: This is DEFAULT behavior! Not needed 
      used for lists of links, where clicking entire row opens up the URL
      - Name - (optional) - Title used as caption
      - [Url] - URL links the image to another location
  
  
  */
    import { isImage, toNotionImageUrl } from '../utils.js'
    import CollectionProp from '../subcomponents/CollectionProp.svelte'

    export let api,
        tableData = null,
        tableRows,
        view

    let _format = view.format
    let _boardColumns,
        _boardColumnsBy,
        _coverType,
        _coverAspect = 'cover',
        _coverProperty,
        _coverSize,
        _props

    // these strings are weird and have some hidden properties; this erases them
    let _description

    // $: if(tableData && tableData.collection.value.description && tableData.collection.value.description[0]) {
    //   _description = tableData.collection.value.description && tableData.collection.value.description[0][0]
    //   isLinks = _description.includes('#links')
    // }

    $: if (view && _format) {
        _boardColumns = _format.board_columns
        _boardColumnsBy = _format.board_columns_by
        _coverType = _format.board_cover && _format.board_cover.type
        _coverSize = _format.board_cover_size || 'medium'
        _coverAspect = _format.board_cover_aspect || 'contain'
        _coverProperty = _format.board_cover && _format.board_cover.property
        _props = _format.board_properties
    }

    // $: console.log('gallery:', tableData.name, ' ::: ', tableRows, 'view:', view, )

    export const getBoardColumns = () => {
        let columns = []

        _boardColumns.map(c => {
            if (!c.hidden) {
                let schema = tableData.schema[c.property]
                let colName = schema.name
                columns.push({ value: c.value, schema })
            }
        })
        return columns
    }

    export const getColumnRecords = column => {
        let records = []

        if (!column.value.value) {
            // empty property column
            tableRows.map(row => {
                if (!row[column.schema.name]) {
                    records.push(row)
                }
            })
        } else {
            tableRows.map(row => {
                if (
                    row[column.schema.name] &&
                    (row[column.schema.name] == column.value.value ||
                        row[column.schema.name].includes(column.value.value))
                ) {
                    records.push(row)
                }
            })
        }

        return records
    }

    // properly orients and filters based on gallery view
    export const getRecordItems = card => {
        let recordItem = []

        _props.map(p => {
            if (p.visible) {
                let schema = tableData.schema[p.property]
                let colName = schema.name
                // recordItem.push({...card, schema: tableData.schema[p.property]})
                recordItem.push({ value: card[colName], schema })
            }
        })
        return recordItem
    }

    export const getCover = card => {
        let cover

        if (_coverType && _coverType == 'property') {
            let colName = tableData.schema[_coverProperty].name
            cover =
                card[colName] && card[colName].length > 0
                    ? card[colName][0]
                    : ''
        } else if (_coverType && _coverType == 'page_cover') {
            cover = {
                url:
                    card.format &&
                    card.format.page_cover &&
                    toNotionImageUrl(card.format.page_cover, card.id),
            }
        }

        return cover
    }

</script>
