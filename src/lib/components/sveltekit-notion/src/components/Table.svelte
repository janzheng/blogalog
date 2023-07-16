<script>
	import { browser } from '$app/environment';
  
  export let block = {};
  export let api = null; api;
  export let tableData = null; tableData;
  export let blocks
  // export let classes = ''
  // export let columns

  function getRows(blockId, tBlock) {
    const block = blocks.find(b=>b?.id==blockId)
    const format = tBlock.format['table_block_column_format'] // object of column widths
    const order = tBlock.format['table_block_column_order'] // array of column order

    const rows = []
    order.map(col => {

      rows.push({
        width: format && format?.[col]?.width, 
        content: block?.properties?.[col] ? block?.properties?.[col]?.[0] : ''
      })
    })

    return rows
  }

  let url, filename;

</script>

<style>
</style>

{#if false}
  <slot />
{/if}

<div class="notion-simpleTable" id={block.id}>
  <figure class="notion-collection-figure">
    <table >
      <!-- <thead>
        <tr>
          <th></th>
        </tr>
      </thead> -->
      <tbody>
        {#each block.content as row, i}
          {@const rows = getRows(row, block)}
          <tr class:header={block.format['table_block_row_header'] && i==0}>
            {#each rows as col, j}
              <td class:header={block.format['table_block_column_header'] && j==0}
                  style={"width:"+col.width+"px"}>
                {col.content}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </figure>
</div>
