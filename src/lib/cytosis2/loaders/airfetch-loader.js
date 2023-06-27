/* 

  maybe split up airfetch vs. airtable loader? airfetch has lots of other helpers

*/

// import { getContent } from "$plasmid/utils/airfetch"

// required for running node locally w/o Svelte / vite, so no access to linked $plasmid
// another way is to import plasmid from node, but it's less flexible for dev
// import { getContent } from "../utils/airfetch.js"
import Cytosis from 'cytosis';



export const airfetchLoader = async (src) => {
  let content = []
  let settings


  if(src.settings) {
    settings = {
      _apiEditorKey: process.env[src.settings['apiKeyName']] || src.settings['apiKey'],
      _baseId: process.env[src.settings['baseIdName']] || src.settings['baseId'],
    }
  }
  // content = await getContent(src.bases, false, true, settings)

  // get airtable using Cytosis w/o airfetch
  let cytosis = await new Cytosis({
    apiKey: settings._apiEditorKey,
    baseId: settings._baseId,
    bases: src.bases,
    flat: true,
  })
  content = cytosis.results

  return content
}



