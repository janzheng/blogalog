/* 
  sometimes this looks for .data; might be from cachet / fuzzyekey; track it down! Should be unwrapped

*/
import { head, seo } from '$lib/config.js'
import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { config as blogalog_config } from '$plasmid/modules/cytosis2/configs/blogalog.config.js';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { applyTransformers } from '$plasmid/modules/cytosis2/transformers';
import { getNotionImageLink } from '$lib/helpers.js'

import { cachet } from '$plasmid/utils/cachet'
import { parseMetadata } from '$lib/helpers.js'
import { cacheClear } from "$plasmid/utils/cache.js";





/* 

  Loads a blogalog from a URL

  - blogPath is something like "ivom" or "jessbio"
  - hostname is something like jess.bio, or blogalog.net

  Loading Modes

  - Blog Base (default)
    - the root is a blog (jess.bio), and each blog can have multiple pages
    - https://blogalog.net, https://jess.bio — loads the main blogalog
    - https://blogalog.net/blog-name, https://jess.bio/blog-name — loads the subpath blogalog

  - Multiblog Base
    - the root can host multiple blogs, and each blog can have multiple pages
    - https://blogalog.net/jessbio — loads the hosted blogalog
    - https://blogalog.net/jessbio/blog-name — loads a path indicated within blogalog


  - loads base blogs index (e.g. blogalog.net index)
    response = await loadBlogalogFromPath({hostname: "/"})

  - returns root source of the current site (localhost, or blogalog.net, etc.)
    response = await loadBlogalogFromPath({hostname: "ivom.phage.directory"})

  - loads base blogs index + sub blog hosted on blogalog (e.g. blogalog.net/yawnxyz)
    -response = await loadBlogalogFromPath({ hostname: "/", blogPath: "yawnxyz" })

  - blog posts are NOT loaded from this function; they need to be handled by the loading function (e.g. layout.server)



  Quirks
  - if no blog is found at blog path, an array of all blogs is returned


  Returns
  - return { cytosis, _head, blogs, isBlogalogHome }
  - { cytosis } contains all the blog information

*/




// these don't really work if a table is publicly shared already!
export const filterSecretsObj = (obj) => {
  if(!obj) return null
  let newObj = {}
  Object.keys(obj).forEach(key => {
    if (obj[key].Secret !== true)
      newObj[key] = obj[key]
  })
  return newObj
}

export const filterSecretsArr = (arr) => {
  if(!arr) return null
  let newArr = []
  arr.forEach(item => {
    if (item.Secret !== true)
      newArr.push(item)
  })
  return newArr
}


// add the ability to get a blogalog slug or from a db id, not just host name?
export const loadBlogalog = async ({ 
  hostname, path, req,
  settings = {
    getBlogs: false,
    getCytosis: false
  }
} = {}) => {

  let blogalogData

  hostname = hostname || req.url?.hostname; // localhost:3055; blogalog.net; jess.bio
  path = path || req.params?.path // [localhost:3055] -> /yawnxyz/biobank-db
  let blogPath = null;
  let pageContent; // content of a specific page / blog post
  // load the base blog to see if it's the blog's Home
  blogalogData = await loadBlogalogFromPath({ hostname, blogPath })

  let pathSegments = path?.split('/'); // ["yawnxyz", "biobank-db"]

  console.log('[base blog]:', hostname, path, pathSegments)

  if (blogalogData.isBlogalogHome && path) {
    /* 
      these paths could look like
      [localhost:3055] /
        yawnxyz/biobank-db
        biobank-db

      so we check if there's a blogalog at that hostname
    */
    // NOT used w/ landing pages like [jess.bio], since looking @ params;
    // only appears when going to sub-pages localhost:3055/yawnxyz/biobank-db
    // when using sveltekit [...path]; they'll show up here
    // note: do this recursively when introducing nested Blogalogs
    let depth = pathSegments.length - 1;
    blogPath = pathSegments[0]; // yawnxyz -> sub blog
    let subBlogalogData = await loadBlogalogFromPath({ hostname, blogPath })
    if (subBlogalogData.cytosis) {
      blogalogData = subBlogalogData
      // if there's a sub blog, use that instead
      // otherwise use the previous route's blogalog data
    }
    // console.log('[sub blog check]:', hostname, "//", blogPath, blogalogData)

    // after we've loaded the deepest blogalog, we check for the next segment and if there's a post there
    // todo: do this recursively?
    // either go one deeper if the path exists, or stay at the same depth
    let slug = pathSegments[depth + 1] || pathSegments[depth]; // biobank-db
    if (slug) {
      // load a specific page post from a slug
      pageContent = blogalogData?.cytosis?.['site-pages']?.find(item => item.Path === slug);
    }
  }

  blogalogData = {
    hostname,
    path,
    blogPath,
    pathSegments,
    isBlogalogHome: blogalogData.isBlogalogHome,
    secrets: filterSecretsObj(blogalogData.cytosis?.["secrets"]), // type: "Secret"
    siteData: filterSecretsObj(blogalogData.cytosis?.["site-data"]), // main blogalog post page
    sitePages: filterSecretsArr(blogalogData.cytosis?.["site-pages"]), // post and other pages
    pageContent, // content of a blog post, if it exists
    cytosis: settings?.getCytosis && blogalogData.cytosis, // only for inspection!
    blogs: settings?.getBlogs && blogalogData.blogs, // this is the list of blogs from blogalog index
    head: blogalogData._head,
  }

  return blogalogData
}


























export const loadBlogalogFromPath = async ({blogPath, hostname, loadAll=false, blogs: blogalogs=[]}={}) => {
  let cytosis, cytosisData, isBlogalogHome, _head = {};
  console.log('[loadBlogalogFromPath] path:', blogPath, 'hostname', hostname)

  /* 
  
    Load all the Config Blog Data
  
  */
  let blogConfigData

  if (!blogalogs || blogalogs.length < 1) {
    // blogs might have been passed down from layout (already loaded)
    blogConfigData = await cachet(`${PUBLIC_PROJECT_NAME}-blogalog_config`, async () => {
        let data = await endoloader(blogalog_config, {
          url: PUBLIC_ENDOCYTOSIS_URL,
          key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
        })
        console.log("blogalog_config data:", data)
        return data
      }, 
      { 
        // used to cache bust the (very resilient) blog config!
        // skipCache: true,
        // setFuzzy: false,
        // ttr: 0, ttl: 0, 
        ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
        ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600 * 24 * 90, // default 90d cache
        bgFn: () => {
          // cacheClear(`${PUBLIC_PROJECT_NAME}-blogalog_config`)
          endoloader(blogalog_config, {
            url: PUBLIC_ENDOCYTOSIS_URL,
            key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
          })
        }
      }
    )
    // let endoData = await endoloader(blogalog_config, {
    //   url: PUBLIC_ENDOCYTOSIS_URL,
    //   key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
    //   // saveCache: false, // handled by cachet
    // })

    blogalogs = blogConfigData?.value?.['blogalog'] 
    // console.log('[endoLoaderData///blogList]:', blogs)
  }

  if(!blogalogs || blogalogs.length < 1) {
    console.error("Blogalog data not loaded", blogConfigData)
    return
  }
  // console.log('[blogalog] blogs:', blogs)
  





  /* 
  
    Load the Blog pages themselves
  
  */
  cytosisData = await Promise.all(blogalogs.map(async (blog) => {
    if (loadAll==false && !(
      (blogPath && blog?.Slug == blogPath) || 
      (blog.URLs && blog.URLs?.split(',').map(url => url.trim()).includes(hostname))
      )) {
        return
      }

    if (
        blogPath && 
        (blog.URLs && blog.URLs?.split(',').map(url => url.trim()).includes(hostname))) {
      console.error('[blogalog] skipping hostname:', hostname, 'and loading path:', blogPath)
      return
      // always prefer path over hostname
      // this breaks when loading blogalog/blog-post since you need hostname first
    }

      
    console.log("1:", blog?.Slug == blogPath, 'path:', blogPath, 'blogSlug:', blog?.Slug)
    console.log("2:", blog?.URLs?.split(',').map(url => url.trim()).includes(hostname), 'hostname:', hostname, 'URLs:', blog?.URLs)
    console.log("3:", blog?.Slug == blogPath || blog?.URLs?.split(',').map(url => url.trim()).includes(hostname))
    
    isBlogalogHome = true

    if (!blog['Pagedata ID']){
      throw new Error(`No Pagedata ID for [${blog['Pagedata ID']}] provided; \n${JSON.stringify(blog, 0, 2)}`)
    }

    // pull the data
    // return await endo({
    //   "sources": [
    //     {
    //       "name": "site-pagedata",
    //       "type": "cfnotion",
    //       "path": `/collection/${blog['Pagedata ID']}`,
    //       "loaders": {
    //         "notionPageId": "id"
    //       },
    //     },
    //   ]
    // })
    let endoloader_config = {
      "sources": [
        {
          "name": "site-pagedata",
          "type": "cfnotion",
          "path": `/collection/${blog['Pagedata ID']}`,
          "loaders": {
            "notionPageId": "id"
          },
        },
      ]
    }

    // console.log('[blogalog] loading:', blog['Slug'], blog['URLs'], 'hostname:', hostname, 'cache key:', `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`, 'config:', endoloader_config)
    

    let finalData =  await cachet(`${PUBLIC_PROJECT_NAME}-${blog['Slug']}`, async () => {
        console.log('[blogalog] Loading Endo:', `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`)
        let data = await endoloader(endoloader_config, {
            key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`,
            url: PUBLIC_ENDOCYTOSIS_URL,
            saveCache: false, // handled by cachet
          })
        return data
      }, 
      {
        // skipCache: true,
        // setFuzzy: false,
        ttl: PUBLIC_CACHET_TTL ? Number(PUBLIC_CACHET_TTL) : 3600 * 24 * 90, // default 90d cache
        ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
        bgFn: () => {
          // cacheClear(`${PUBLIC_PROJECT_NAME}-${blog['Slug']}`)÷
          console.log('[blogalog] << Reloading Endo >> ', `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`)
          endoloader(endoloader_config, { url: PUBLIC_ENDOCYTOSIS_URL, key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}` });
        }
      })

    return finalData
  }))

  // clear empty items from cytosisData
  cytosisData = cytosisData.filter(c => c)
  // console.log('cytosis data:', cytosisData)
  if (cytosisData?.length > 0) {
    cytosis = cytosisData[cytosisData.length-1]?.value
    // sometimes this trips up and loads the base blogalog page instead of the leaf page (esp. on localhost)

    if (cytosis?.['site-pagedata']?.length > 0) {
    // all page data settings do NOT have a "type"; these are accessible by key
      cytosis['site-data'] = applyTransformers(cytosis['site-pagedata'].filter(p => !Array.isArray(p.Type)), [{
        "function": "transformArrayToObjectByKey",
        "settings": {
          "objectKey": "Name"
        }
      }])

      cytosis['secrets'] = applyTransformers(cytosis['site-pagedata'].filter(p => p.Type && p.Type.includes("Secret")), [{
        "function": "transformArrayToObjectByKey",
        "settings": {
          "objectKey": "Name"
        }
      }])

      // every "page" has a type; otherwise it's a setting; these are an
      cytosis['site-pages'] = applyTransformers(cytosis['site-pagedata'].filter(p => p.Type && !p.Type.includes("Secret")), [{
        "function": "transformArrayVersionedObjects",
        // "settings": {
        //   "uniqueKey": "Path", // unique field to track versions against
        //   "versionKey": "Version", // version name / number field
        // }
      }])

      // extract metadata
      cytosis['site-pages'].forEach((page, i) => {
        if (page.Metadata) {
          cytosis['site-pages'][i].MetaObj = parseMetadata(page.Metadata)
        }
      })
    }

    _head = {
      title: cytosis?.['site-data']?.['SiteTitle']?.Content,
      author: cytosis?.['site-data']?.['Author']?.Content,
      description: cytosis?.['site-data']?.['SiteDescription']?.Content,
      url: cytosis?.['site-data']?.['URL']?.Content,
      canonical: cytosis?.['site-data']?.['URL']?.Content,
      title: cytosis?.['site-data']?.['SiteTitle']?.Content,
      ico: getNotionImageLink(cytosis?.['site-data']?.['IconImage']), 
      image: {
        url: getNotionImageLink(cytosis?.['site-data']?.['CardImage']),
        width: 850,
        height: 650,
      },
      meta: [
        { name: "twitter:site", content: cytosis?.['site-data']?.['TwitterHandle']?.Content },
        { name: "twitter:title", content: cytosis?.['site-data']?.['SiteTitle']?.Content },
        { name: "twitter:description", content: cytosis?.['site-data']?.['SiteDescription']?.Content },
        { name: "twitter:image", content: getNotionImageLink(cytosis?.['site-data']?.['CardImage']) },
        { name: "twitter:image:alt", content: cytosis?.['site-data']?.['SiteDescription']?.Content },
        { property: "og:image:url", content: getNotionImageLink(cytosis?.['site-data']?.['CardImage']) },
        { property: "og:image", content: getNotionImageLink(cytosis?.['site-data']?.['CardImage']) },
      ],
      links: [
        { rel: 'icon', type: 'image/png', href: getNotionImageLink(cytosis?.['site-data']?.['IconImage']) }
      ]
    }
  }

  // console.log('[cytosisData] object:', cytosis)
  return { cytosis, _head, blogs: blogalogs, isBlogalogHome }
}
