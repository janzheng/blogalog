<table
    class="notion-collection-table {tableWrap ? 'notion-collection-tablewrap' : ''}">
    {#if tableData.columns}
        <thead>
            <tr>
                {#each tableData.columns as column}
                    {#if column.visible == true && column.name}
                        <th style="width:{column.width}px;">{column.name}</th>
                    {/if}
                {/each}
            </tr>
        </thead>
    {/if}
    {#if tableData.columns}
        <tbody>
            {#each tableRows as record, rowCounter}
                <tr id="block-{record.id}">
                    {#each tableData.columns as column, colCounter}
                        {#if column.visible == true && column.name}
                            <td class={tableData.columns[colCounter].type}>
                                <CollectionProp
                                    fieldItem={record[column.name]}
                                    {tableData}
                                    {api}
                                    {record}
                                    schema={tableData.columns[tableData.columns.findIndex(f => f.name == column.name)]} />
                            </td>
                        {/if}
                    {/each}
                </tr>
            {/each}
        </tbody>
    {/if}
</table>

<script>
    import { isImage } from '../utils.js'
    import CollectionProp from '../subcomponents/CollectionProp.svelte'

    export let api
    export let tableData = null
    export let tableRows, view

    let _format = view.format,
        _props
    let tableWrap = _format.table_wrap;

    console.log('Collection Table!!!', tableData, tableRows, view)

</script>
