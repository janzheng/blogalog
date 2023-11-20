
import { json } from '@sveltejs/kit';

// import { loadBlogalog, loadBlogalogFromPageId, buildBlogPage, buildBlogHead } from '$lib/blogalog'

import { endo, endoloader } from '$plasmid/modules/cytosis2';


export const GET = async (req) => {
  let response, blogalogData;
  let pageId

  // retrieve thru cf-notion-worker
  // this has NO FILTERING CAPABILITY and returns A LOT of extra data
  // will timeout cf-notion-loader
  // pageId = "dff5d33fc8de49c6b57e9dee74c51e8c" // blogalog page data
  // pageId = "0f9f24f82570441186a8c10d9f788412" // blogalog collection
  
  pageId = "f2ca2eb92d184200b0d371f822af1856" 
  // turn off loaders.notionPageId for this
  // all C&T links collection; 3MB total; lots of unneeded data
  // (timeout; this won't load; crashes CF w/ timeout)
  // view=Atifs%20Links&limit=999&payload=rows
  
  console.log('loading endo...',pageId)
  response = await endo({
    "sources": [
      {
        "name": "results",
        "type": "cfnotion",
        "path": `collection/${pageId}?view=Atifs%20Links&limit=5&payload=rows`,
        // "loaders": {
        //   "notionPageId": "id"
        // },
      },
    ]
  })


  return json(response)
}

