
/* 

loads a page for griditems

*/

import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { hjson } from '$plasmid/utils/sveltekit-helpers'
import { json } from '@sveltejs/kit';
import { cachet } from '$plasmid/utils/cachet'
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { parseMetadata, keyRemap } from '$plasmid/utils/helpers';

export const GET = async ({ request }) => {
  return json({success: true})
}

export const POST = async ({ request }) => {
  let { config = {}, id, settings } = await request.json()

  config = {
    "sources": [
      {
        "name": "page",
        "type": "cfnotion-pages",
        "path": `/page/${id}`
      },
    ]
  }
  
  let result
  let key = `${PUBLIC_PROJECT_NAME}-id-${id}`
  
  // NO CACHING
  // result = await endoloader(config, {
  //   url: PUBLIC_ENDOCYTOSIS_URL,
  //   key: key
  // }); console.log("RESULTTT", result)

  // console.log('-----:::', key, config)


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
    let page = result?.value?.page

    const getPageBlockValues = (page) => {
      // pages data wrapped in {id: id.value}, and we want to just get the value itself
      return Object.values(page).map((el) => el.value);
    }

    
    return hjson({ success: true, pageBlocks: getPageBlockValues(page) })
  }

  return hjson({ success: false, })
}

