import { error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { PUBLIC_PROJECT_NAME, PUBLIC_CY_TYPE, PUBLIC_CY_CONFIG_PATH, PUBLIC_FUZZYKEY_URL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { head, seo } from '$lib/config.js'

import { config as blogalog_config } from '$plasmid/modules/cytosis2/configs/blogalog.config.js';
import { config as jz_config } from '$plasmid/modules/cytosis2/configs/cytosis.config.janzheng.js';
// import { config as js_config } from '$plasmid/modules/cytosis2/configs/cytosis.config.jessbio.js';
import { config as js2_config } from '$plasmid/modules/cytosis2/configs/cytosis.config.jessbio2.js';

import { loadBlogalogFromPath } from '$lib/blogalog'
import FuzzyKey from '$plasmid/utils/fuzzykey'
import { cachet } from '$plasmid/utils/cachet'

import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { applyTransformers } from '$plasmid/modules/cytosis2/transformers';



async function initContent(_head) {
  let cytosis
  console.log('[initContent] initializing:', PUBLIC_CY_TYPE)

  if (PUBLIC_CY_TYPE == 'blogalog') {
    ({ _head, cytosis } = await loadBlogalogFromPath('blogalog'));
  } else {
    let config
    if (PUBLIC_CY_TYPE == 'janzheng') {
      config = jz_config
    } else if (PUBLIC_CY_TYPE == 'jessbio') {
      config = js2_config
    }
    cytosis = await cachet(`${PUBLIC_PROJECT_NAME}-${PUBLIC_CY_TYPE}`, async () => {
      return await endoloader(config, {
        url: PUBLIC_ENDOCYTOSIS_URL
      })
    }, {
      skip: false,
      bgFn: () => endoloader(config, { url: PUBLIC_ENDOCYTOSIS_URL, key: `${PUBLIC_PROJECT_NAME}-${PUBLIC_CY_TYPE}` })
    })

    // make sure this is ABOVE the _head code, since it references the transformed array object
    // Experiment: trying to combine the two notion dbs into ONE
    // if combined site-pagedata, we want to unroll it into site-data and sitepages
    //     results = applyTransformers(results, src.transformers)
    if (cytosis?.['site-pagedata']?.length > 0) {
      cytosis['site-data'] = applyTransformers(cytosis['site-pagedata'], [{
        "function": "transformArrayToObjectByKey",
        "settings": {
          "objectKey": "Name"
        }
      },
      ])
      cytosis['site-pages'] = applyTransformers(cytosis['site-pagedata'].filter(p => p.Type), [{
        "function": "transformArrayVersionedObjects",
        "settings": {
          "uniqueKey": "Path", // unique field to track versions against
          "versionKey": "Version", // version name / number field
        }
      },
      ])
    } 

    if (cytosis && PUBLIC_CY_TYPE !== 'janzheng') {
      _head = PUBLIC_CY_TYPE !== "janzheng" ? {
        title: cytosis?.['site-data']?.['SiteTitle']?.Content,
        author: cytosis?.['site-data']?.['Author']?.Content,
        description: cytosis?.['site-data']?.['SiteDescription']?.Content,
        url: cytosis?.['site-data']?.['URL']?.Content,
        canonical: cytosis?.['site-data']?.['URL']?.Content,
        title: cytosis?.['site-data']?.['SiteTitle']?.Content,
        ico: cytosis?.['site-data']?.['IconImage']?.Content || cytosis?.['site-data']?.['IconImage']?.Files?.[0].url,
        image: {
          url: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage']?.Files?.[0].url,
          width: 850,
          height: 650,
        },
        meta: [
          { name: "twitter:site", content: cytosis?.['site-data']?.['TwitterHandle']?.Content },
          { name: "twitter:title", content: cytosis?.['site-data']?.['SiteTitle']?.Content },
          { name: "twitter:description", content: cytosis?.['site-data']?.['SiteDescription']?.Content },
          { name: "twitter:image", content: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage']?.Files?.[0].url },
          { name: "twitter:image:alt", content: cytosis?.['site-data']?.['SiteDescription']?.Content },
          { property: "og:image:url", content: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage']?.Files?.[0].url },
          { property: "og:image", content: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage']?.Files?.[0].url },
        ],
        links: [
          { rel: 'icon', type: 'image/png', href: cytosis?.['site-data']?.['IconImage']?.Content || cytosis?.['site-data']?.['IconImage']?.Files?.[0].url }
        ]
      } : null // head
    }

  }

  return {cytosis, _head}
}


export const load = async ({ params, setHeaders, locals}) => {
  try {

    let fuzzy = FuzzyKey({ url: PUBLIC_FUZZYKEY_URL })
    
    // // let add = await fuzzy.set("banana/rama", {fruit:"bannnnanana!!"})
    // let fzz = await fuzzy.get("banana/rama")
    // console.log("fuzzy get:", fzz.data)
    // setting cachet w/ a function
    // let myvar = "ok I can't believe this works lol"
    // await cachet('testkey', ()=>{
    //   console.log('myvar...', myvar)
    //   return myvar
    // }, {skip: true})
    // console.log("cachet testkey!!!", await cachet('testkey'))
    // console.log("cachet!!!", await cachet('banana/rama'))
    // let fuzzytest = await fuzzy.get("testkey")
    // console.log("fuzzytest", fuzzytest.data)

    // let {cytosis, _head} = await initContent(head)
    let cytosis, _head

    ({ cytosis, _head } = await initContent(head)) // don't cachet here; leave cachet strategy to blogalogloader or other loaders
    // example of how to cachet at the top:
    // ({ cytosis, _head } = await cachet(`${PUBLIC_PROJECT_NAME}-${PUBLIC_CY_TYPE}`, async ()=>{
    //    return await initContent(head)
    // // }, {skip: false}))
    // }, {skip: true})) // skips the cache; good for debugging

    // this loads the new content, but has a chance of not running on serverless when data is returned
    // before initContent finishes loading
    // cachet(`cytosis-${PUBLIC_CY_TYPE}`, async () => {
    //   return await initContent(head)
    // }, { skip: true })

    return {
      head: _head,
      seo: PUBLIC_CY_TYPE == "janzheng" && seo, // need to generalize this more
      user: locals?.user,
      cytosis: cytosis, // testing all
      // ... await endo(config, {sourceNames: ['site-data']}),
      // streamed: {
      //   // cytosis: endo(config, {sourceNames: ['site-pages']}) // streamed await
      // }

      // streamed: {
      //   // this acts as an SWR cache updater; it loads after the initial load, and updates cache keys 
      //   // this does keep the browser spinning though which isn't ideal 
      //   refresh: await cachet(`cytosis-${PUBLIC_CY_TYPE}`, async () => {
      //     return await initContent(head)
      //   }, { skip: true })
      // }
    }
  }
  catch (err) {
    console.error(err)
    throw errorjson(500, err)
  }
}



















// import { getContent } from '$routes/api/content/+server.js'
// import config  from '$lib/cytosis2/cytosis.config.json';
// import { config }  from '$lib/cytosis2/cytosis.config.experimental.js';



    // let content = await getContent() 
    // console.log('[+layout.server.js] params', params)
    // console.log('--->>>> cytosisConfig:', config)
    // let cytosis = await endo(config)
    // console.log('--->>>> cytosisData:', cytosis)
    // console.log('--->>>> cytosisData:', JSON.stringify(cytosis, 0, 2)))




    // if (PUBLIC_CY_CONFIG_PATH) { // dynamic import // too slow!
    //   config = await import(PUBLIC_CY_CONFIG_PATH /* @vite-ignore */)
    //   config = config.config
    // } else {
    //   // import { config }  from '$lib/cytosis2/cytosis.config.janzheng.js';
    //   // manually import config files here for vite; will end up in "chunks"
    //   // alternatively do: import copy from 'rollup-plugin-copy'
    //   // config = await import('$lib/cytosis2/cytosis.config.jessbio.js' /* @vite-ignore */)
    //   // config = await import('$lib/cytosis2/cytosis.config.janzheng.js' /* @vite-ignore */)
    // }




// const customLibraryEventTransformer = (results) => {
//   // for every item in the rollup object, do some calculations
//   Object.keys(results).forEach((objKey) => {
//     let object = results[objKey]
//     object['Name'] = object.columnMap?.Name?.[0]

//     let rating = 0, numRatings = 0
//     object.columnMap?.['Attribute::Name']?.forEach((attr, i) => {
//       if(attr == 'Rating') {
//         console.log('Calculating Rating:', attr, i, object.columnMap?.Number?.[i], typeof(object.columnMap?.Number?.[i]))
//         // rating = rating + object.columnMap?.Number?.[i] // this is WRONG! Since Airtable drops columns that don't have numbers
//         numRatings++
//         rating = rating + object.events[i].Number // this is the right way to add the ratings
//       }
//     })
//     object['Rating'] = rating / numRatings // get the average of ratings
//   })
//   return results
// }

