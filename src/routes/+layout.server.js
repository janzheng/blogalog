import { error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
// import { getContent } from '$routes/api/content/+server.js'
import { head, seo } from '$lib/config.js'

// import config  from '$lib/cytosis2/cytosis.config.json';
// import { config }  from '$lib/cytosis2/cytosis.config.experimental.js';
import { config }  from '$lib/cytosis2/cytosis.config.prod.js';
import { endo } from '$lib/cytosis2';


export const load = async ({params, locals}) => {
  try {
    // let content = await getContent() 

    // console.log('[+layout.server.js] params', params)
    // let cytosis = await endo(config)
    console.log('--->>>> cytosisConfig:', config)
    // console.log('--->>>> cytosisData:', cytosis)
    // console.log('--->>>> cytosisData:', JSON.stringify(cytosis, 0, 2)))

    return {
      head, seo,
      user: locals?.user,
      ... await endo(config, {sourceNames: ['jz-data']}),
      streamed: {
        // cytosis: endo(config), // streamed await
        cytosis: endo(config, {sourceNames: ['jz-posts']})
      }
    }
  }
  catch (err) {
    console.error(err)
    throw errorjson(500, err)
  }
}



