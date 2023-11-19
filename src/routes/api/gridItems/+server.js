
/* 

  items / 
  Make into a generic Endoloader / Cache Loader?
  - might open up more attack vectors; keep to items just now

*/

import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { hjson } from '$plasmid/utils/sveltekit-helpers'
import { json } from '@sveltejs/kit';
import { cachet } from '$plasmid/utils/cachet'
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { parseMetadata, keyRemap } from '$plasmid/utils/helpers';

import YAML from 'yaml'

import { NOTION_API } from '$env/static/private';
import { Client, iteratePaginatedAPI } from '@notionhq/client';
import { notionObjToFlatJson } from '$lib/notion';
const notion = new Client({ auth: NOTION_API });



// This function processes and filters items
function processItems(items, settings) {
  items = items?.map(item => {

    if (settings?.mapping) {
      let remappedMem = keyRemap(item, settings?.mapping);
      return remappedMem;
    }
    return item
  });

  items = items?.filter(mem => mem[`Show`] ? mem[`Show`] : true)
  items = items?.filter(mem => mem[`Hide`] ? !mem[`Hide`] : true)

  if (settings?.filter) {
    // Split the settings.filter string into an array of names
    let filterNames = settings?.filter?.split(',')?.map(name => name.trim());

    // Filter the items array
    if (filterNames) {
      let filterKey = settings?.filterKey || 'Name';
      items = items?.filter(mem => filterNames.includes(mem[filterKey]));
    }
  }
  items = items?.map(item => {
    if (settings?.disallow) {
      settings.disallow.forEach(field => {
        if(item[field])
          delete item[field]
      })
    }
    return item
  })

  return items;
}





export const GET = async ({ request }) => {
  return json({success: true})
}

export const POST = async ({ request }) => {
  let { config, id, settings, pageNumber = 1, startCursor } = await request.json()

  try {
    if(!config) {
      config = {
        "sources": [
          {
            "name": "items",
            "type": "cfnotion",
            "path": `/collection/${id}`
          },
        ]
      }
    }


    // settings = parseMetadata(settings)
    if (typeof settings === 'string')
      settings = YAML.parse(settings)
    else if (!settings)
      settings = {}

    let result
    let key = `${PUBLIC_PROJECT_NAME}-id-${id}`

    // NO CACHING
    // result = await endoloader(config, {
    //   url: PUBLIC_ENDOCYTOSIS_URL,
    //   key: key
    // })


    // use native Notion API loader; default
    // if (id && settings.loader == 'notion') {
    if (id && settings.loader?.type == 'notion') {
      let pageSize = settings.loader?.pageSize || 10;

      let response, items=[];

      key = `${key}-pageSize_${pageSize}-pageNumber_${pageNumber}-cursor_${startCursor}`
      let result = await cachet(key, async () => {
        let _items = []; // INNER ITEMS
        for (let i = 0; i < pageNumber; i++) {
          response = await notion.databases.query({
            page_size: pageSize,
            start_cursor: startCursor,
            database_id: id,
            filter: settings.loader?.filter || {},
            sorts: settings.loader?.sorts || [],
          });

          if (i === pageNumber - 1) {
            const pageItems = response.results.map(item => notionObjToFlatJson(item));
            _items = processItems(pageItems, settings);
          }

          startCursor = response.next_cursor;
          if (!startCursor) break; // Exit the loop if there are no more pages
        }
        // console.log('ITEMS ::::', _items.length, startCursor)
        return {items: _items, startCursor}
      }, {
        // ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600 * 24 * 90, // default 90d cache
        // ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 60 * 10, // ttr won't work if not on cytosis
        // ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600, // refresh / reload every 30m
        ttl: 60 * 30, // refresh in-browser / reload every 30m

        // skipCache: true,
      })

      // if cached, the value will be stored as result.value
      if(result.value) {
        result = result.value
      }

        // console.log('last response RESULT:', key, pageSize, pageNumber, result) // will show if more items are around, etc.
        // console.log('last response:', key, pageSize, pageNumber, result.items.length, result.startCursor) // will show if more items are around, etc.
      // console.log('NOTION API RESPONSE:: ITEMS', items)
      return hjson({ success: true, startCursor: result.startCursor, items: result.items, settings })
    }





    // CACHING
    result = await cachet(`${key}`, async () => {
      let data = await endoloader(config, {
        url: PUBLIC_ENDOCYTOSIS_URL,
        key: key
      })
      return data
    }, {
      ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
      ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600 * 24 * 90, // default 90d cache
      bgFn: () => {
        endoloader(config, {
          url: PUBLIC_ENDOCYTOSIS_URL,
          key: key
        })
      }
    })


    if (result) {
      let value = result?.value?.value ? JSON.parse(result?.value?.value) : result?.value
      let items = value?.items;
      items = processItems(items, settings);
      return hjson({ success: true, items, settings })
    }

    return hjson({ success: false, })

  } catch (e) {
    console.error('[api/gridItems] error', e)
    return hjson({ success: false, })
  }
}

