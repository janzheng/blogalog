
import { head, seo } from '$lib/config.js'
import { PUBLIC_PROJECT_NAME, PUBLIC_CACHET_TTR, PUBLIC_ENDOCYTOSIS_URL } from '$env/static/public';

import { config as blogalog_config } from '$plasmid/modules/cytosis2/configs/blogalog.config.js';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { applyTransformers } from '$plasmid/modules/cytosis2/transformers';

import { cachet } from '$plasmid/utils/cachet'
import { parseMetadata } from '$lib/helpers.js'



export const loadBlogalogFromPath = async (path, hostname, loadAll=false) => {
  let cytosis, cytosisData, isBlogalog, _head = {};
  console.log('[loadBlogalogFromPath] path:', path, 'hostname', hostname)

  // load the config
  // let endoData = await endo(blogalog_config)
  // let endoData = await endoloader(blogalog_config, {
  //   url: PUBLIC_ENDOCYTOSIS_URL
  // })
  let endoData = await cachet(`${PUBLIC_PROJECT_NAME}-blogalog_config`, async () => {
    return await endoloader(blogalog_config, {
      url: PUBLIC_ENDOCYTOSIS_URL
    })
  }, 
  // { // used to cache bust the (very resilient) blog config!
  //   skip: true, ttr: 0, ttl: 0, 
  //   bgFn: async () => await endoloader(blogalog_config, {
  //     url: PUBLIC_ENDOCYTOSIS_URL
  //   })
  // }
  )

  let blogs = endoData['blogalog']
  // console.log('[blogList]:', blogs)

  if(!blogs) {
    console.error("Blogalog data not loaded")
    return
  }
  



  cytosisData = await Promise.all(blogs.map(async (blog) => {
    if (loadAll==false && !(
      (path && blog?.Slug == path) || 
      (blog.URLs && blog.URLs?.split(',').map(url => url.trim()).includes(hostname))
      )) {
        console.log('escape!')
        return
      }

    if (path && (blog.URLs && blog.URLs?.split(',').map(url => url.trim()).includes(hostname))) {
      return
      // always prefer path over hostname
    }
      
    console.log("1:", blog?.Slug == path, 'path:', path, 'blogSlug:', blog?.Slug)
    console.log("2:", blog?.URLs?.split(',').map(url => url.trim()).includes(hostname), 'hostname:', hostname, 'URLs:', blog?.URLs)
    console.log("3:", blog?.Slug == path || blog?.URLs?.split(',').map(url => url.trim()).includes(hostname))

    // testing only; skip default
    if (!blog['URLs']) return
    
    isBlogalog = true

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

    console.log('[blogalog] loading:', blog['Slug'], blog['URLs'], 'hostname:', hostname, 'cache key:', `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`, 'config:', endoloader_config)


    return await cachet(`${PUBLIC_PROJECT_NAME}-${blog['Slug']}`, async () => {
      return await endoloader(endoloader_config, {
          key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`,
          url: PUBLIC_ENDOCYTOSIS_URL
        })
      }, 
      // {
      //   skip: true,
      //   ttr: PUBLIC_CACHET_TTR ? Number(PUBLIC_CACHET_TTR) : 3600,
      //   bgFn: () => endoloader(endoloader_config, { url: PUBLIC_ENDOCYTOSIS_URL, key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}` })
      // }
    )
  }))

  // clear empty items from cytosisData
  cytosisData = cytosisData.filter(c => c)
  if (cytosisData?.length > 0) {
    cytosis = cytosisData[0]
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
      ico: cytosis?.['site-data']?.['IconImage']?.Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url,
      image: {
        url: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url,
        width: 850,
        height: 650,
      },
      meta: [
        { name: "twitter:site", content: cytosis?.['site-data']?.['TwitterHandle']?.Content },
        { name: "twitter:title", content: cytosis?.['site-data']?.['SiteTitle']?.Content },
        { name: "twitter:description", content: cytosis?.['site-data']?.['SiteDescription']?.Content },
        { name: "twitter:image", content: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url },
        { name: "twitter:image:alt", content: cytosis?.['site-data']?.['SiteDescription']?.Content },
        { property: "og:image:url", content: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url },
        { property: "og:image", content: cytosis?.['site-data']?.['CardImage']?.Content || cytosis?.['site-data']?.['CardImage'].Files?.[0].url },
      ],
      links: [
        { rel: 'icon', type: 'image/png', href: cytosis?.['site-data']?.['IconImage']?.Content || cytosis?.['site-data']?.['IconImage'].Files?.[0].url }
      ]
    }
  }

  console.log('[cytosisData] Total:', cytosisData.length)
  return { cytosis, _head, isBlogalog }
}
