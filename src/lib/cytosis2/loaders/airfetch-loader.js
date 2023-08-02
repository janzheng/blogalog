/* 

  Gets data from Airtable w/ airfetch 
  
  - maybe split up airfetch vs. airtable loader? airfetch has lots of other helpers



  // Example w/ airtable and a flatten transformer

    {
      "name": "airfetch-test",
      "type": "airfetch",
      "settings": {
        "apiKeyName": "AIRTABLE_LINKS_API",
        "baseIdName": "AIRTABLE_LINKS_BASE",
      },
      "bases": [{
        "tables": ["Books [Entities]", "Attributes"],
        "options": {
          "view": "Grid view"
        }
      }],
      "transformers": [
        {
          "function": "transformFlattenKeyedObject",
        }
      ]
    },








  // Example w/ event-rollup transformers and custom library transformer

  {
    "name": "airfetch-events-rollup-test",
    "type": "airfetch",
    "settings": {
      "apiKeyName": "AIRTABLE_LINKS_API",
      "baseIdName": "AIRTABLE_LINKS_BASE",
    },
    "bases": [{
      "tables": ["Events [Values]"],
      "options": {
        "view": "Grid view"
      }
    }],
    "transformers": [
      "transformFlattenKeyedObject", 
      "rollupEventsArrayToObjectByKey",
      "customLibraryEventTransformer"
    ]
  },


  Using the Custom transformer:

    cytosis: endo(config, {
      transformers: [customLibraryEventTransformer],
    }), // testing all

    const customLibraryEventTransformer = (results) => {
      // for every item in the rollup object, do some calculations
      Object.keys(results).forEach((objKey) => {
        let object = results[objKey]
        object['Name'] = object.columnMap?.Name?.[0]

        let rating = 0, numRatings = 0
        object.columnMap?.['Attribute::Name']?.forEach((attr, i) => {
          if(attr == 'Rating') {
            console.log('Calculating Rating:', attr, i, object.columnMap?.Number?.[i], typeof(object.columnMap?.Number?.[i]))
            // rating = rating + object.columnMap?.Number?.[i] // this is WRONG! Since Airtable drops columns that don't have numbers
            numRatings++
            rating = rating + object.events[i].Number // this is the right way to add the ratings
          }
        })
        object['Rating'] = rating / numRatings // get the average of ratings
      })
      return results
    }

*/

// import { getContent } from "$plasmid/utils/airfetch"

// required for running node locally w/o Svelte / vite, so no access to linked $plasmid
// another way is to import plasmid from node, but it's less flexible for dev
// import { getContent } from "../utils/airfetch.js"
// import Cytosis from 'cytosis';
import Cytosis from '../utils/cytosis.js';

import { applyTransformers, transformArrayToObjectByKey, transformRemap } from '../transformers/index.js'


export const airfetchLoader = async (src) => {
  let results = []
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
  results = cytosis.results
  results = applyTransformers(results, src.transformers)

  return results
}



