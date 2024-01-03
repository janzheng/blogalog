import { error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { PUBLIC_PROJECT_NAME, PUBLIC_BLOGMODE, PUBLIC_FUZZYKEY_URL, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL } from '$env/static/public';

import { head, seo } from '$lib/config.js'
import { loadBlogalogFromPath } from '$lib/blogalog'
// import { parseMetadata, getNotionImageLink } from '$lib/helpers.js'

// import builderClubInit from '$lib/data/builderclubinit.js';



function removePrefixFromHostname(url) {
  let hostname = url.hostname;
  // Use a regular expression to remove any prefixes
  hostname = hostname.replace(/^(www\.|blog\.|subdomain\.)+/i, '');
  return hostname;
}




async function initContent(head, hostname) {
  // "act" as another base domain for testing
  // hostname = "www.jess.bio"
  // hostname = "pgh.phage.directory"

  // console.log('[[[[[ LAYOUT ]]]]] data/builderClubInit.js')
  // return builderClubInit;
  console.log('[+layout.server/initContent] initializing:', PUBLIC_BLOGMODE, 'host:', hostname)
  let blog, config, mode, blogalogPages

  if (PUBLIC_BLOGMODE == 'blogalog') {
    // ({ head, cytosis } = await loadBlogalogFromPath('blogalog', hostname)); // previously, needed to specify blogalog; now uses the hostname/domain
    // console.log('hostname:', hostname)
    let blogalog = await loadBlogalogFromPath({hostname});

    if(blogalog) {
      ({ head, blog, blogalogPages } = blogalog);
    } else {
      // NOTE: don't do this if on a subpath; or maybe just don't do this at all?
      // otherwise will load base blog AND sub blog, which is slowwww
      // for default or wrong hostnames, pull default blogalog
      // console.error('[layout] No custom blog or page found; defaulting to load [BLOGALOG]')
      // blogalog = await loadBlogalogFromPath("blogalog");
      // if (blogalog) ({ _head, cytosis } = blogalog);
    }

    if(!blogalog) {
      // this happens on preview paths, where the hostname is not the same as the blogalog
      // this will load the "preview" mode which is normally blogalog (Set on "pages")
      blogalog = await loadBlogalogFromPath({ hostname: "preview" });
      ({ head, blog, blogalogPages } = blogalog);
    }
  }

  return { blog, head, blogalogPages }
}


export const load = async ({ url, params, setHeaders, locals}) => {
  // return {}


  console.log('<--- +layout.server.js / load --->')
  try {
    let hostname = url?.hostname
    

    // let {cytosis, _head} = await initContent(head)
    let blog, head, blogalogPages
    ({ blog, head, blogalogPages } = await initContent(head, hostname)); // don't cachet here; leave cachet strategy to blogalogloader or other loaders
    // example of how to cachet at the top:
    // ({ cytosis, _head } = await cachet(`${PUBLIC_PROJECT_NAME}-${PUBLIC_BLOGMODE}`, async ()=>{
    //    return await initContent(head)
    // // }, {skipCache: false}))
    // }, {skipCache: true})) // skips the cache; good for debugging

    // this loads the new content, but has a chance of not running on serverless when data is returned
    // before initContent finishes loading
    // cachet(`cytosis-${PUBLIC_BLOGMODE}`, async () => {
    //   return await initContent(head)
    // }, { skipCache: true })

    console.log('<!--- +layout.server.js / load --->')
    let returnObj = {
      path: params?.path,
      pathSegments: params?.path?.split('/'),
      hostname, 
      origin: url?.origin,
      plainUrl: removePrefixFromHostname(url),
      
      head: head,
      // seo: PUBLIC_BLOGMODE == "janzheng" && seo, // need to generalize this more
      user: locals?.user,
      // cytosis: blog, // testing all
      blog: blog, // testing all
      blogalogPages,
      // ... await endo(config, {sourceNames: ['site-data']}),
      // streamed: {
      //   // cytosis: endo(config, {sourceNames: ['site-pages']}) // streamed await
      // }

      // streamed: {
      //   // this acts as an SWR cache updater; it loads after the initial load, and updates cache keys 
      //   // this does keep the browser spinning though which isn't ideal 
      //   refresh: await cachet(`cytosis-${PUBLIC_BLOGMODE}`, async () => {
      //     return await initContent(head)
      //   }, { skipCache: true })
      // }
    };
    return returnObj;
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

