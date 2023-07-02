import { error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
// import { getContent } from '$routes/api/content/+server.js'
import { head, seo } from '$lib/config.js'

// import config  from '$lib/cytosis2/cytosis.config.json';
// import { config }  from '$lib/cytosis2/cytosis.config.experimental.js';
import { config }  from '$lib/cytosis2/cytosis.config.prod.js';
import { endo } from '$lib/cytosis2';


const customLibraryEventTransformer = (results) => {
  // for every item in the rollup object, do some calculations
  Object.keys(results).forEach((objKey) => {
    let object = results[objKey]
    object['Name'] = object.columnMap?.Name?.[0]

    let rating = 0, numRatings = 0
    object.columnMap?.['Attribute::Name']?.forEach((attr, i) => {
      if(attr == 'Rating') {
        console.log('Calculating Rating:', attr, i, object.columnMap?.Number?.[i], typeof(object.columnMap?.Number?.[i]))
        // rating = rating + object.columnMap?.Number?.[i] // this is WRONG! Since Airtable drops columns that don't have numbers
        numRatings++
        rating = rating + object.events[i].Number // this is the right way to add the ratings
      }
    })
    object['Rating'] = rating / numRatings // get the average of ratings
  })
  return results
}



export const load = async ({params, locals}) => {
  try {
    // let content = await getContent() 

    // console.log('[+layout.server.js] params', params)
    // console.log('--->>>> cytosisConfig:', config)
    // let cytosis = await endo(config)
    // console.log('--->>>> cytosisData:', cytosis)
    // console.log('--->>>> cytosisData:', JSON.stringify(cytosis, 0, 2)))

    return {
      head, seo,
      user: locals?.user,
      cytosis: endo(config, {
        transformers: [customLibraryEventTransformer],
      }), // testing all
      // ... await endo(config, {sourceNames: ['jz-data']}),
      // streamed: {
      //   // cytosis: endo(config, {sourceNames: ['jz-pages']}) // streamed await
      // }
    }
  }
  catch (err) {
    console.error(err)
    throw errorjson(500, err)
  }
}



