
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




export const GET = async ({ request }) => {
  return json({success: true})
}

export const POST = async ({ request }) => {
  let { config = {}, id, settings } = await request.json()

  config = {
    "sources": [
      {
        "name": "items",
        "type": "cfnotion",
        "path": `/collection/${id}`
      },
    ]
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
    let value = result?.value?.value ? JSON.parse(result?.value?.value) : result?.value // bug in endocytosis I don't feel like fixing
    let items = value?.items?.map(item => {
      if (settings?.disallow) {
        settings.disallow.forEach(field => {
          delete item[field]
        })
      }

      if(settings?.mapping) {
        let remappedMem = keyRemap(item, settings?.mapping);
        return remappedMem;
      }
      return item
    });
    items = items?.filter(mem => mem[`Show`] ? mem[`Show`] : true)
    items = items?.filter(mem => mem[`Hide`] ? !mem[`Hide`] : true)

    if (settings?.filter) {
      // Split the settings.filter string into an array of names
      let filterNames = settings?.filter.split(',')?.map(name => name.trim());

      // Filter the items array
      if(filterNames)
        items = items?.filter(mem => filterNames.includes(mem['Name']));
    }

    return hjson({ success: true, items, settings })
  }

  return hjson({ success: false, })
}

