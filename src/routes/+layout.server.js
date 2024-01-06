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
  console.log('[+layout.server/initContent] initializing:', PUBLIC_BLOGMODE, 'host:', hostname)
  let blog, config, mode, blogalogPages
  if (PUBLIC_BLOGMODE == 'blogalog') {
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

async function loadContent(url, params, locals, head, hostname, seo) {
  // let {cytosis, _head} = await initContent(head)
  console.log(`\n<-- +layout.server.js / load ${hostname} -->\n`)
  let blog, blogalogPages
  ({ blog, head, blogalogPages } = await initContent(head, hostname)); // don't cachet here; leave cachet strategy to blogalogloader or other loaders

  let returnObj = {
    path: params?.path,
    pathSegments: params?.path?.split('/'),
    hostname,
    origin: url?.origin,
    plainUrl: removePrefixFromHostname(url),

    head: head,
    // seo: seo, // need to generalize this more
    user: locals?.user,
    blog,
    blogalogPages,
  };
  console.log(`\n</-- +layout.server.js / finished ${hostname} -->\n`)
  return returnObj;
}

export const load = async ({ url, params, setHeaders, locals}) => {
  // return {}
  let hostname = url?.hostname
  // "act" as another base domain for testing
  // hostname = "www.blogalog.net"
  // hostname = "www.404site.com"
  // hostname = "www.jess.bio"
  // hostname = "atif.phage.directory"
  // hostname = "pgh.phage.directory"
  // hostname = "ivom.phage.directory"
  
  try {
    let result = await loadContent(url, params, locals, head, hostname, seo);

    if(!result.blog) {
      // if there isn't a page here, we just load standard blogalog
      hostname = "www.blogalog.net"
      result = await loadContent(url, params, locals, head, hostname, seo);
    }

    return result;
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

