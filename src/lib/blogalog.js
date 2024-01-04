/* 
  sometimes this looks for .data; might be from cachet / fuzzyekey; track it down! Should be unwrapped

*/
// import { head, seo } from '$lib/config.js'
import { PUBLIC_USE_DIRECTORY_CACHE, PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_CACHET_TTL, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { config as blogalog_config } from '$plasmid/modules/cytosis2/configs/blogalog.config.js';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { applyTransformers } from '$plasmid/modules/cytosis2/transformers';
import { getNotionImageLink } from '$lib/helpers.js'

import { cachet } from '$plasmid/utils/cachet'
import { parseMetadata, cleanDirectoryData, cleanNotionPageData } from '$lib/helpers.js'
// import { cacheClear } from "$plasmid/utils/cache.js";

import cachedDirectory from '$src/data/cachedDirectory.js';




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





/* 

  UTILS + BUILDERS

*/

// these don't really work if a table is publicly shared already!
// but still keep them around for "semi-secret" things you don't want to appear
// not good for PII and GDPR stuff though (use Secret for that)
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

export const buildBlogPage = (blogDataArr, index) => {

  let blog
  if (!Array.isArray(blogDataArr)) {
    // can pass in a single blog object instead of an arr
    blogDataArr = [blogDataArr];
  }
  
  if (!index)
    index = blogDataArr.length > 0 ? blogDataArr.length - 1 : 0;

  // the blog data arr could have more than one blog;
  // here we just build the LAST blog in the arr
  // this is helpful bc we might just be getting a recursive list of blogs, and this is the last / deepest
  blog = blogDataArr[index]?.value
  blog['pageDataId'] = blogDataArr[index]?.pageId // this is what's reported from blogalog page directory, used for self-updating
  blog['slug'] = blogDataArr[index]?.slug // this is what's reported from blogalog page directory, used for self-updating

  // sometimes this trips up and loads the base blogalog page instead of the leaf page (esp. on localhost)
  if (blog?.['site-pagedata']?.length > 0) {
    // all page data settings do NOT have a "type"; these are accessible by key
    blog['site-data'] = applyTransformers(blog['site-pagedata'].filter(p => (!Array.isArray(p.Type) || p.Type?.includes('Settings'))), [{
      "function": "transformArrayToObjectByKey",
      "settings": {
        "objectKey": "Name"
      }
    }])

    blog['secrets'] = applyTransformers(blog['site-pagedata'].filter(p => p.Type && p.Type.includes("Secret")), [{
      "function": "transformArrayToObjectByKey",
      "settings": {
        "objectKey": "Name"
      }
    }])


    // every "page" has a type; otherwise it's a setting
    blog['site-pages'] = applyTransformers(blog['site-pagedata'].filter(p => p.Type && !["Secret", "Settings"].some(type => p.Type.includes(type))), [{
      "function": "transformArrayVersionedObjects",
      // "settings": {
      //   "uniqueKey": "Path", // unique field to track versions against
      //   "versionKey": "Version", // version name / number field
      // }
    }])

    // remove site-pagedata (raw Notion CF data) to reduce size
    delete blog['site-pagedata']

    // extract metadata
    blog['site-pages'].forEach((page, i) => {
      if (page.Metadata) {
        blog['site-pages'][i].MetaObj = parseMetadata(page.Metadata)
      }
    })
  }

  return blog
}

export const buildBlogHead = (blog) => {
  let icoImg = getNotionImageLink(blog?.['site-data']?.['IconImage']) || blog?.['site-data']?.['IconImage']?.Content
  let cardImg = getNotionImageLink(blog?.['site-data']?.['CardImage']) || blog?.['site-data']?.['CardImage']?.Content
  let desc = blog?.['site-data']?.['ShortDescription']?.Content
  let _head = {
    title: blog?.['site-data']?.['SiteTitle']?.Content,
    author: blog?.['site-data']?.['Author']?.Content,
    description: desc,
    url: blog?.['site-data']?.['URL']?.Content || blog?.['site-data']?.['CanonicalURL']?.Content,
    canonical: blog?.['site-data']?.['URL']?.Content,
    title: blog?.['site-data']?.['SiteTitle']?.Content,
    ico: icoImg,
    image: {
      url: cardImg,
      width: 850,
      height: 650,
    },
    openGraph: {
      title: blog?.['site-data']?.['SiteTitle']?.Content,
      url: blog?.['site-data']?.['URL']?.Content || blog?.['site-data']?.['CanonicalURL']?.Content,
      description: desc,
      // image: cardImg,
      images: [{
        url: cardImg,
        width: 850,
        height: 650,
      }]
    },
    twitter: {
      site: blog?.['site-data']?.['TwitterHandle']?.Content,
      card: 'summary_large_image',
      title: blog?.['site-data']?.['SiteTitle']?.Content,
      description: desc,
      image: cardImg,
      imageAlt: desc,
    },
    // meta: [
    //   { name: "twitter:site", content: blog?.['site-data']?.['TwitterHandle']?.Content },
    //   { name: "twitter:title", content: blog?.['site-data']?.['SiteTitle']?.Content },
    //   { name: "twitter:description", content: desc },
    //   { name: "twitter:image", content: cardImg },
    //   { name: "twitter:image:alt", content: desc },
    //   { property: "og:image:url", content: cardImg },
    //   { property: "og:image", content: cardImg },
    // ],
    links: [
      { rel: 'icon', type: 'image/png', href: icoImg }
    ],
  }

  return _head
}









/* 

  Partial Loaders / Assemblers

*/


/* 
    Load all the Config Blogalog Directory Data from the official BLogalog Notion DB
*/
export const loadBlogalogDirectory = async () => {

  if (PUBLIC_USE_DIRECTORY_CACHE === "true") {
    console.warn("----> Using Cached Directory Values! [cachedDirectory.js]");
    console.warn("----> [cachedDirectory] -- items:", cachedDirectory.length);
    return cachedDirectory
  }

  // blogs might have been passed down from layout (already loaded)
  let blogConfigData = await cachet(`${PUBLIC_PROJECT_NAME}-blogalog_config`, async () => {
    let data = await endoloader(blogalog_config, {
      url: PUBLIC_ENDOCYTOSIS_URL,
      key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
    })

    // let blogConfigData = data?.value?.['blogalog']
    // this gets cached!
    // console.log('blogConfigData ---->>>> ', JSON.stringify(blogConfigData, 0, 2))

    data = cleanDirectoryData(data.value?.['blogalog'])
    return data
    // return blogConfigData
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

  // let returnData = cleanDirectoryData(blogConfigData.value?.['blogalog'] || blogConfigData)
  // list of blogalogs / blog pages + IDs as listed in the DB
  // handles unclean data (v1) or cleaned data (v2)
  return blogConfigData.value?.['blogalog'] || blogConfigData
}

// ** if you're looking for the fn that actually loads data... this is it ;)
// this fn pulls the data from Notion / KV Cache using Endoloader
// can use this directly to pull non-blogalog-indexed pages
export const loadBlogalogFromPageId = async ({pageId, slug}) => {
  // pull the data from local
  // prefer using endoloader, the CF version
  // return await endo({
  //   "sources": [
  //     {
  //       "name": "site-pagedata",
  //       "type": "cfnotion",
  //       "path": `/collection/${pageId}`,
  //       "loaders": {
  //         "notionPageId": "id"
  //       },
  //     },
  //   ]
  // })

  // slug is set from the blogalog page index, but could be missing from custom loads
  // slug is used as an ID for the cache
  if(!slug)
    slug = pageId

  // If PUBLIC_USE_PAGE_CACHE is true, try to load data from a specific file
  if (process.env.PUBLIC_USE_PAGE_CACHE === "true") {
    try {
      const cachedData = await import(`$src/data/${slug}.js`);
      console.warn(`----> Using Cached Page Values! [$src/data/${slug}.js]`);
      return cachedData.default;
    } catch (error) {
      console.warn(`----> No Cached Page Found! [$src/data/${slug}.js]`);
      // If the file doesn't exist, continue to pull data from the API
    }
  } else {
    console.log(`----> Using CDN data to load ${slug}`);
  }


  let endoloader_config = {
    "sources": [
      {
        "name": "site-pagedata",
        "type": "cfnotion",
        "path": `/collection/${pageId}`,
        "loaders": {
          "notionPageId": "id"
        },
      },
    ]
  }

  console.log('[loadBlogalogFromPageId] loading:', slug, pageId, endoloader_config)
  

  let finalData = await cachet(`${PUBLIC_PROJECT_NAME}-${slug}`, async () => {
    // console.log('[blogalog] Loading Endo:', `${PUBLIC_PROJECT_NAME}-${slug}`)
    let data = await endoloader(endoloader_config, {
      key: `${PUBLIC_PROJECT_NAME}-${slug}`,
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
        // cacheClear(`${PUBLIC_PROJECT_NAME}-${slug}`)÷
        // console.log('[blogalog] << Reloading Endo >> ', `${PUBLIC_PROJECT_NAME}-${slug}`)
        endoloader(endoloader_config, { url: PUBLIC_ENDOCYTOSIS_URL, key: `${PUBLIC_PROJECT_NAME}-${slug}` });
      }
    })

  finalData = cleanNotionPageData(finalData);
  finalData['pageId'] = pageId;
  finalData['slug'] = slug;
  // this is for caching the data:
  // console.log(`[loadBlogalogFromPageId] ---> Slug: ${slug} Data:\n---\n`,JSON.stringify(finalData),`\n---\n`)
  return finalData
}

/* 
  Load the Blog pages themselves
  - this can load multiple blogs based on the path/host configuration
*/
export const loadBlogalogData = async ({ blogalogPages, blogPath, hostname, loadAll }) => {
  // map through all blogalog pages to find the correct blog, or get ALL of them if loadAll is true
  let blogArray = await Promise.all(blogalogPages.map(async (blog) => {
    if (loadAll == false && !(
      (blogPath && blog?.Slug == blogPath) ||
      (blog.URLs && blog.URLs?.split(',').map(url => url.trim()).includes(hostname))
    )) {
      return
    }

    // match the correct blog path
    if (
      blogPath &&
      (blog.URLs && blog.URLs?.split(',').map(url => url.trim()).includes(hostname))) {
      // always prefer path over hostname
      // this breaks when loading blogalog/blog-post since you need hostname first
      console.error('[blogalog] skipping hostname:', hostname, 'and loading path:', blogPath)
      return
    }

    // console.log('<loadBlogalogData Retrieval> --- ', { blogPath, hostname })
    // console.log(blog)
    // // base blogalog + sub blog: localhost/ivom, blogalog.net/ivom
    // console.log("1:", blog?.Slug == blogPath, 'path:', blogPath, 'blogSlug:', blog?.Slug) // 
    // // host blogalog: blogalog.net, jess.bio
    // console.log("2:", blog?.URLs?.split(',').map(url => url.trim()).includes(hostname), 'hostname:', hostname, 'URLs:', blog?.URLs)
    // // this is generally true; always true for localhost; could be false if host doesn't exist in list of blog urls
    // console.log("3:", blog?.Slug == blogPath || blog?.URLs?.split(',').map(url => url.trim()).includes(hostname))
    // console.log('</Blog Data>')

    if (!blog['Pagedata ID']) {
      throw new Error(`No Pagedata ID for [${blog['Pagedata ID']}] provided; \n${JSON.stringify(blog, 0, 2)}`)
    }

    let blogData = await loadBlogalogFromPageId({pageId: blog['Pagedata ID'], slug: blog['Slug']})
    return blogData
  }))

  // one or more matched blog posts; could be ALL blog posts!
  blogArray = blogArray.filter(c => c)
  return blogArray
}


/* 

  Full loaders (uses assemblers)

*/
// add the ability to get a blogalog slug or from a db id, not just host name?
export const loadBlogalog = async ({
  hostname, path, req,
  settings = {
    getBlogs: false,
    getBlog: false
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

  // if there's a path, we check if there's a sub blog and use that
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
    if (subBlogalogData.blog) {
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
      pageContent = blogalogData?.blog?.['site-pages']?.find(item => item.Path === slug);
    }
  }

  blogalogData = {
    hostname,
    path,
    blogPath,
    pathSegments,
    isBlogalogHome: blogalogData.isBlogalogHome,
    secrets: filterSecretsObj(blogalogData.blog?.["secrets"]), // type: "Secret"
    siteData: filterSecretsObj(blogalogData.blog?.["site-data"]), // main blogalog post page
    sitePages: filterSecretsArr(blogalogData.blog?.["site-pages"]), // post and other pages
    pageContent, // content of a blog post, if it exists
    blog: settings?.getBlog && blogalogData.blog, // only for inspection!
    blogs: settings?.getBlogs && blogalogData.blogs, // this is the list of blogs from blogalog index
    head: blogalogData._head,
  }

  return blogalogData
}

// loads blogalog page or post depending on path
export const loadBlogalogFromPath = async ({
  blogPath, hostname, 
  loadAll = false, 
  blogalogPages = [], // table of blogalog data / e.g. the Blogalog Page List
}={}
  ) => {
  let blog, blogDataArr, isBlogalogHome, head = {};
  console.log('[loadBlogalogFromPath] path:', {hostname, blogPath, loadAll })
  // console.log('[loadBlogalogFromPath] path:', {hostname, blogPath, loadAll, blogalogPages})

  if (!blogalogPages || blogalogPages.length < 1) {
    blogalogPages = await loadBlogalogDirectory() 
    console.log('[blogalogPages Directory]:', blogalogPages.length)
    // these are official blogalog indexed pages from the Blogalog PageList
  }

  if(!blogalogPages || blogalogPages.length < 1) {
    console.error("Blogalog data not loaded...")
    throw new Error("Blogalog data not loaded");
  }
  
  // get the actual blog page data in an array
  blogDataArr = await loadBlogalogData({ blogalogPages, blogPath, hostname, loadAll })
  isBlogalogHome = true // todo: is this still necessary?

  if (blogDataArr?.length > 0) {
    blog = buildBlogPage(blogDataArr)
    head = buildBlogHead(blog)
  }

  // console.log('[cytosisData] object:', cytosis)
  // "cytosis" as a key is depreacted; use something more descriptive...
  console.log('[loadBlogalogFromPath] done...')
  return { blog, cytosis: blog, head, blogalogPages, isBlogalogHome }
}
