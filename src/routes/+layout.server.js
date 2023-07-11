import { error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { PUBLIC_CY_TYPE, PUBLIC_CY_CONFIG_PATH } from '$env/static/public';

// import { getContent } from '$routes/api/content/+server.js'
import { head, seo } from '$lib/config.js'

// import config  from '$lib/cytosis2/cytosis.config.json';
// import { config }  from '$lib/cytosis2/cytosis.config.experimental.js';
import '$lib/cytosis2/cytosis.config.janzheng.js';
import '$lib/cytosis2/cytosis.config.jessbio.js';




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

    let config, cytosis, _head = head;
    if (PUBLIC_CY_CONFIG_PATH) { // dynamic import
      config = await import(PUBLIC_CY_CONFIG_PATH /* @vite-ignore */)
      config = config.config
    } else {
      // import { config }  from '$lib/cytosis2/cytosis.config.janzheng.js';

      // manually import config files here for vite; will end up in "chunks"
      // alternatively do: import copy from 'rollup-plugin-copy'
      config = await import('$lib/cytosis2/cytosis.config.jessbio.js' /* @vite-ignore */)
      config = await import('$lib/cytosis2/cytosis.config.janzheng.js' /* @vite-ignore */)
    }

    cytosis = await endo(config, {
      transformers: [customLibraryEventTransformer],
    })
    if (config && PUBLIC_CY_TYPE !== 'janzheng' ) {
  
      _head = PUBLIC_CY_TYPE !== "janzheng" ? {
        title:  cytosis?.['site-data']?.['SiteTitle'].Content,
        author:  cytosis?.['site-data']?.['Author'].Content,
        description:  cytosis?.['site-data']?.['SiteDescription'].Content,
        url:  cytosis?.['site-data']?.['URL'].Content,
        canonical: cytosis?.['site-data']?.['URL'].Content,
        title: cytosis?.['site-data']?.['SiteTitle'].Content,
        ico: cytosis?.['site-data']?.['IconImage'].Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url,
        image: {
          url: cytosis?.['site-data']?.['CardImage'].Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url,
          width: 850,
          height: 650,
        },
        meta: [
          { name: "twitter:site", content: cytosis?.['site-data']?.['TwitterHandle'].Content },
          { name: "twitter:title", content: cytosis?.['site-data']?.['SiteTitle'].Content },
          { name: "twitter:description", content: cytosis?.['site-data']?.['SiteDescription'].Content },
          { name: "twitter:image", content: cytosis?.['site-data']?.['CardImage'].Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url },
          { name: "twitter:image:alt", content: cytosis?.['site-data']?.['SiteDescription'].Content },
          { property: "og:image:url", content: cytosis?.['site-data']?.['CardImage'].Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url },
          { property: "og:image", content: cytosis?.['site-data']?.['CardImage'].Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url },
        ],
        links: [
          { rel: 'icon', type: 'image/png', href: cytosis?.['site-data']?.['IconImage'].Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url }
        ]
      } : head
    }

    return {
      head: _head,
      seo: PUBLIC_CY_TYPE == "janzheng" && seo, // need to generalize this more
      user: locals?.user,
      cytosis: cytosis, // testing all
      // ... await endo(config, {sourceNames: ['site-data']}),
      // streamed: {
      //   // cytosis: endo(config, {sourceNames: ['site-pages']}) // streamed await
      // }
    }
  }
  catch (err) {
    console.error(err)
    throw errorjson(500, err)
  }
}



