
import { head, seo } from '$lib/config.js'
import { PUBLIC_CY_BLOGALOG } from '$env/static/public';

import { config as blogalog_config } from '$lib/cytosis2/blogalog.config.js';
import { endo } from '$lib/cytosis2';
import { applyTransformers } from '$lib/cytosis2/transformers';





export const loadBlogalogFromPath = async (path) => {
  let cytosis, cytosisData, isBlogalog, _head;
  let endoData = await endo(blogalog_config)
  let blogs = endoData['blogalog']

  if(!blogs) {
    console.error("Blogalog data not loaded")
    return
  }


  cytosisData = await Promise.all(blogs.map(async (blog) => {
    if (blog?.Slug !== path) return
    isBlogalog = true

    // pull the data
    return await endo({
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
    })
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

    _head = {
      title: cytosis?.['site-data']?.['SiteTitle'].Content,
      author: cytosis?.['site-data']?.['Author'].Content,
      description: cytosis?.['site-data']?.['SiteDescription'].Content,
      url: cytosis?.['site-data']?.['URL'].Content,
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
    }
  }

  return { cytosis, _head, isBlogalog }
}
