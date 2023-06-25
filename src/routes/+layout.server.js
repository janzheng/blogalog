import { error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
// import { getContent } from '$routes/api/content/+server.js'
import { head, seo } from '$lib/config.js'

import config  from '$lib/cytosis2/cytosis.config.json';
import { endo } from '$lib/cytosis2';


export const load = async ({params, locals}) => {
  try {
    // let content = await getContent()

    // console.log('[+layout.server.js] params', params)

    let cytosisData = await endo(config)
    console.log('--->>>> cytosisData:', cytosisData)

    return {
      head, seo,
      user: locals?.user,
      // content,
    }
  }
  catch (err) {
    console.error(err)
    throw errorjson(500, err)
  }
}



