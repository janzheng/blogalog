
export const config = {
  runtime: 'edge'
};


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
import { parseYaml } from '$lib/helpers';

// import YAML from 'yaml'

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
      items = items?.filter(mem => {
        // Split the mem[filterKey] string into an array of names
        let memValues = mem[filterKey]?.split(',')?.map(name => name.trim());
        // Check if any of the values in mem[filterKey] are included in filterNames
        return memValues?.some(value => filterNames.includes(value));
      });
    }
  }

  if (settings?.sort) {
    let { column, order } = settings.sort;
    console.log("SORTTT", column, order)
    items = items?.sort((a, b) => {
      let aValue = a[column]?.toLowerCase();
      let bValue = b[column]?.toLowerCase();

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0; // equal values
    });
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

// load using the Notion API, which is really slow
async function gridLoadNotion({ id, settings, pageNumber, startCursor, key }) {
  let pageSize = settings.loader?.pageSize || 10;

  let response, items = [];

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
    return { items: _items, startCursor }
  }, {
    // ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600 * 24 * 90, // default 90d cache
    // ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 60 * 10, // ttr won't work if not on cytosis
    // ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600, // refresh / reload every 30m
    ttl: 60 * 30, // refresh in-browser / reload every 30m

    // skipCache: true,
  })

  // if cached, the value will be stored as result.value
  if (result.value) {
    result = result.value
  }

  return { success: true, startCursor: result.startCursor, items: result.items, settings }
  // return hjson({ success: true, startCursor: result.startCursor, items: result.items, settings })
}

// loads using cf-notion, which is also really slow haha
// but at least it's caching aggressively
async function gridEndoLoader({ id, settings, pageNumber, key }) {
  let pageId = id
  let view = settings?.loader?.view;
  let limit = settings?.loader?.pageSize || 999;
  let payload = settings?.loader?.payload || 'rows';
  pageNumber = pageNumber || settings?.loader?.pageNumber || 1;

  let pagesToPreload = 3; // number of pages to preload

  // calculate the initial page number for the given page number
  let initialPageNumber = Math.floor((pageNumber - 1) / pagesToPreload) * pagesToPreload + 1;

  // calculate total limit based on initial page number
  let totalLimit = limit * (initialPageNumber + pagesToPreload - 1);


  let config = {
    "sources": [
      {
        "name": "items",
        "type": "cfnotion",
        "path": `collection/${pageId}?${view ? `view=${view}&` : ''}limit=${totalLimit}&payload=${payload}`,
      },
    ]
  }

  // preload more pages before the end of the pagination
  // this ends up loading the next batch of data into the cache
  if (pageNumber > pagesToPreload - 2) {
    let newLimit = limit * pagesToPreload + totalLimit
    // console.log('Loading More:', newLimit)
    let _config = {
      "sources": [
        {
          "name": "items",
          "type": "cfnotion",
          "path": `collection/${pageId}?${view ? `view=${view}&` : ''}limit=${newLimit}&payload=${payload}`,
        },
      ]
    }
    let _key = key + `-limit_${newLimit}` // use totalLimit instead of limit
    if (view) { _key += `-view_${view}` }
    if (payload) { _key += `-payload_${payload}` }
    // send off the job w/o waiting on it
    endoloader(config, {
      url: PUBLIC_ENDOCYTOSIS_URL,
      key: key
    })
  }



  key += `-limit_${totalLimit}` // use totalLimit instead of limit
  if (view) { key += `-view_${view}` }
  if (payload) { key += `-payload_${payload}` }

  // console.log('endoLoading:', key, config, "pagesToPreload", pagesToPreload, "totalLimit:", totalLimit, "pageNumber", pageNumber, "initialPageNumber", initialPageNumber, "limit", limit)


  let result
  result = await cachet(`${key}`, async () => {
    let data = await endoloader(config, {
      url: PUBLIC_ENDOCYTOSIS_URL,
      key: key
    })
    return data
  }, {
    // cytosis notion loader
    ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 5, // reload every 5
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
    // Limit the items to the newest pageNumber * limit
    let startIndex = (pageNumber - 1) * limit;
    let endIndex = pageNumber * limit;
    items = items?.slice(startIndex, endIndex);

    return { success: true, items, settings, startCursor: pageNumber }
  }
}





export const GET = async ({ request }) => {
  return json({success: true})
}


export const POST = async ({ request }) => {
  let { config, id, settings, pageNumber, startCursor } = await request.json()

  try {

    // settings = parseMetadata(settings)
    if (typeof settings === 'string')
      settings = parseYaml(settings)
    else if (!settings)
      settings = {}

    let key = `${PUBLIC_PROJECT_NAME}-id-${id}`
    let result

    // NO CACHING
    // result = await endoloader(config, {
    //   url: PUBLIC_ENDOCYTOSIS_URL,
    //   key: key
    // })


    // use native Notion API loader; default
    // if (id && settings.loader == 'notion') {
    if (id && settings.loader?.type == 'notion') {
      result = await gridLoadNotion({ id, settings, pageNumber, startCursor, key })
      return hsjon(result)
    }
    
    // endoloader / cytosis
    else {
      result = await gridEndoLoader({ id, settings, pageNumber, key })
      return hjson(result)
    }

  } catch (e) {
    console.error('[api/gridItems] error', e)
    return hjson({ success: false, })
  }
}

