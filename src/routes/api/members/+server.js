
/* 

  Members / 
  Make into a generic Endoloader / Cache Loader?
  - might open up more attack vectors; keep to members just now


  DEPRECATED
  Use "gridItems" as a more generalized version of this!

*/

import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { hjson } from '$plasmid/utils/sveltekit-helpers'
import { json } from '@sveltejs/kit';
import { cachet } from '$plasmid/utils/cachet'
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { parseMetadata, keyRemap } from '$plasmid/utils/helpers';
import { safeParse } from '$lib/helpers';

// import YAML from 'yaml'




export const GET = async ({ request }) => {
  return json({success: true})
}

export const POST = async ({ request }) => {
  let { config = {}, id, settings } = await request.json()

  config = {
    "sources": [
      {
        "name": "members",
        "type": "cfnotion",
        "path": `/collection/${id}`
      },
    ]
  }

  // settings = parseMetadata(settings)
  if(settings)
    settings = safeParse(settings)

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
    let members = value?.members.map(mem => {
      if(settings?.mapping) {
        let remappedMem = keyRemap(mem, settings?.mapping);
        if (remappedMem.Photo && Array.isArray(remappedMem.Photo)) {
          remappedMem.Photo = remappedMem.Photo[0]?.rawUrl;
        }
        return remappedMem;
      }
      return mem
    });
    members = members.filter(mem => mem[`Show`] ? mem[`Show`] : true)
    members = members.filter(mem => mem[`Hide`] ? !mem[`Hide`] : true)



    if (settings?.filter) {
      // Split the settings.filter string into an array of names
      let filterNames = settings.filter.split(',').map(name => name.trim());

      // Filter the members array
      members = members.filter(mem => filterNames.includes(mem['Name']));
    }


    return hjson({ success: true, members })
  }

  return hjson({ success: false, })
}

