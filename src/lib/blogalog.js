/* 
  sometimes this looks for .data; might be from cachet / fuzzyekey; track it down! Should be unwrapped

*/
import { head, seo } from '$lib/config.js'
import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { config as blogalog_config } from '$plasmid/modules/cytosis2/configs/blogalog.config.js';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { applyTransformers } from '$plasmid/modules/cytosis2/transformers';
import { getNotionImageLink } from '$lib/helpers.js'

import { cachet } from '$plasmid/utils/cachet'
import { parseMetadata } from '$lib/helpers.js'


// blogPath is something like /jessbio/
export const loadBlogalogFromPath = async ({blogPath, hostname, loadAll=false, blogs=[]}={}) => {
  let cytosis, cytosisData, isBlogalogHome, _head = {};
  console.log('[loadBlogalogFromPath] path:', blogPath, 'hostname', hostname)

  /* 
  
    Load all the Config Blog Data
  
  */

  if (!blogs || blogs.length < 1) {
    // blogs might have been passed down from layout (already loaded)
    let blogConfigData = await cachet(`${PUBLIC_PROJECT_NAME}-blogalog_config`, async () => {
        let data = await endoloader(blogalog_config, {
          url: PUBLIC_ENDOCYTOSIS_URL,
          key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
          // saveCache: false, // handled by cachet
        })
        console.log("blogalog_config data:", data)
        return data
        // return data?.value
      }, 
      { // used to cache bust the (very resilient) blog config!
        // skipCache: true,
        // setFuzzy: false,
        // ttr: 0, ttl: 0, 
        // ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
        // bgFn: async () => await endoloader(blogalog_config, {
        //   url: PUBLIC_ENDOCYTOSIS_URL
        // })
      }
    )
    // let endoData = await endoloader(blogalog_config, {
    //   url: PUBLIC_ENDOCYTOSIS_URL,
    //   key: `${PUBLIC_PROJECT_NAME}-blogalog_config`,
    //   // saveCache: false, // handled by cachet
    // })

    blogs = blogConfigData?.value?.['blogalog'] 
    // console.log('[endoLoaderData///blogList]:', blogs)
  }

  if(!blogs || blogs.length < 1) {
    console.error("Blogalog data not loaded", blogConfigData)
    return
  }
  





  /* 
  
    Load the Blog pages themselves
  
  */
  cytosisData = await Promise.all(blogs.map(async (blog) => {
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
    console.log("===> loading resource:", blog?.Slug)
    
    isBlogalogHome = true

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

    return await cachet(`${PUBLIC_PROJECT_NAME}-${blog['Slug']}`, async () => {
        let data = await endoloader(endoloader_config, {
          key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`,
          url: PUBLIC_ENDOCYTOSIS_URL,
          // saveCache: false, // handled by cachet
        })
        return data
        // return data?.value
      }, 
      {
        // skipCache: true,
        // setFuzzy: false,
        // ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
        // bgFn: () => endoloader(endoloader_config, { url: PUBLIC_ENDOCYTOSIS_URL, key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}` })
      }
    )
  }))

  // clear empty items from cytosisData
  cytosisData = cytosisData.filter(c => c)
  if (cytosisData?.length > 0) {
    cytosis = cytosisData[0]?.value
    if (cytosis?.['site-pagedata']?.length > 0) {
      cytosis['site-data'] = applyTransformers(cytosis['site-pagedata'], [{
        "function": "transformArrayToObjectByKey",
        "settings": {
          "objectKey": "Name"
        }
      }])
      cytosis['site-pages'] = applyTransformers(cytosis['site-pagedata'].filter(p => p.Type), [{
        "function": "transformArrayVersionedObjects",
        "settings": {
          "uniqueKey": "Path", // unique field to track versions against
          "versionKey": "Version", // version name / number field
        }
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
  return { cytosis, _head, blogs, isBlogalogHome }
}
