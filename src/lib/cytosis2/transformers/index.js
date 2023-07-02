import * as R from 'ramda'; 

import { llmKeyPrompt, llmArrayPrompt } from './llm-transformers.js'
import { transformDataBySchema } from './transformDataBySchema.js'
import { transformUnstructuredTextKey, transformUnstructuredTextKeyArray } from './transformUnstructuredText.js'
import { scrapeKey, scrapeArray } from './scrapingbee-transformer.js'

import { mapKeys, compareVersions } from './utils.js'





export const applyTransformers = (results, transformers, sources) => {
  if(!transformers || !Array.isArray(transformers))
    return results

  for (const transformer of transformers) {
    const transformerFunction = transformerMap[transformer.function || transformer]; 
    // transformer could look like a single string, e.g. "outputObject" if no settings given
    results = transformerFunction(results, transformer.settings, sources);
    // console.log('[applyTransformers] ----->', results, transformer.function, transformer.settings)
  }

  return results
}


export const addTransformers = (transformers) => {
  // "transformers" is an array of custom transformer functions
  // refer to these custom functions in the config like normal
  transformers.forEach(tr => {
    transformerMap[tr.name] = tr
  })
}





// 
//  Data Transformers
// 


// returns an array remapTransformResults
export const transformRemap = (results, {remap, oneKeyDeep}={}) => {
  // remap each row of results, if array
  if (Array.isArray(results)) {
    let arr = []
    // remap transform each row, if we want to do that
    results.forEach((item) => {
      arr.push(remap ? mapKeys((key) => remap[key] || key, item) : item)
    })
    results = arr
    return results
  } else {
    // remap each key of results, if object
    // go one key deep into the object, e.g. Cytosis results or array-transformed object { key1: [...], key2: {...}}
    if (oneKeyDeep) {
      let obj = {}
      Object.keys(results).forEach((key) => {
        obj[key] = transformRemap(results[key], {remap})
      })
      results = obj
    } else {
      let obj = (remap ? mapKeys((key) => remap[key] || key, results) : results)
      results = obj
    }

    return results
  }
}



// returns an object
export const transformArrayToObjectByKey = (results, {objectKey="Name"}={}) => {
  let resultObject = {}
  if (objectKey) {
    results.forEach((item) => {
      resultObject[item[objectKey]] = item
    })
  } else {
    return results
  }

  return resultObject
}


/* 

  Turns a keyed object:
    { key1: { data1 }, key2: { data2 } ...} 
  or
    { key1: [ data1 ], key2: [ data2 ] ...}

  into 
    { ...data1, ...data2, ... }
  or 
    [ ...data1, ...data2, ... ]

*/
export const transformFlattenKeyedObject = (results) => {
  if (Array.isArray(Object.values(results)?.[0])) {
    let data = []
    Object.keys(results).forEach((k) => {
      data = [ ...data, ...results[k] ]
    })
    return data
  } else {
    // console.log('objectFlatten:', results)
    let data = {}
    Object.keys(results).forEach((k) => {
      data = {...data, ...results[k]}
    })
    return data
  }
}



/* 

  Take an array of objects: if they have repeated unique keys, add collate the previous versions into the arrayed object

  - If a record doesn't have a version number, it's treated as version "1"
  - All versioned data posts are stored an array called "versions"

  [
    { blogName: "blog1", version: "1", ... },
    { blogName: "blog1", version: "2", ... },
  ]

  ->

  [
    { blogName: "blog1", versions: [{ blogName: "blog1", version: "1" }, {v2, ...}]},
  ]

  "transformers": [
    {
      "function": "transformArrayVersionedObjects",
      "settings": {
        "uniqueKey": "Path", // unique field to track versions against
        "versionKey": "Version", // version name / number field  
      }
    }
  ]
*/
export const transformArrayVersionedObjects = (results, { uniqueKey="Name", versionKey="Version" } = {}) => {
  if (!Array.isArray(results)) return results
  let postObject = {} // instead of sorting / shuffling things around, we just add them to the object by key

  // first pass: add all empties and v1s to posts
  results.forEach((post) => {
    post[versionKey] = post[versionKey] || "1"
    postObject[post[uniqueKey]] = postObject[post[uniqueKey]] || { versions: [] }
    postObject[post[uniqueKey]]['versions'].push(post)
  })
  // console.log('----> postObject', postObject)

  // sort post versions
  // transform keyed object back into array
  let posts = []
  Object.keys(postObject).forEach(postKey => {
    let sortedVersions = postObject[postKey]['versions'].sort((a, b) => {
      return compareVersions(a[versionKey], b[versionKey])
    })
    sortedVersions.reverse() // reverse so that the latest version is first; mutates array
    posts.push({
      [uniqueKey]: postKey,
      versions: sortedVersions,
      ...sortedVersions[0] // add the latest version's data back into the object
    })
  })

  // console.log('----> posts array', posts)
  return posts 
}








// 
//  Event Rollups + Calculators
// 

export const rollupEventsArrayToObjectByKey = (eventsArray, {objectKey="Name"} = {}) => {
  let resultObject = {
  }
  
  // for each event in the array, create a new object w/ the objectKey as name,
  // then add the event to the object's list of events
  eventsArray.forEach((event) => {
    if (!resultObject[event[objectKey]]) { resultObject[event[objectKey]] = { events: []} }
    resultObject[event[objectKey]].events = [...resultObject[event[objectKey]].events, event]
  })


  // now we process each column into a keyed object of arrays, for each column, e.g. 
  // Date: [date1, date2, ...], JSON, [...json1, ...json2]
  Object.keys(resultObject).forEach((objKey) => {
    let value = resultObject[objKey] // e.g. "The Catcher in the Rye"
    let events = value.events // e.g. [event1, event2, ...]
    /* 
      Note that dbs like Airtable drops columns that have no data
      We don't want to add empty cells of data as that will cause bloat, since we deal with a lot of sparse data
      This just means that either the data source needs to have 0's, or we can't always rely on columnMap for numerical ops
    */
    let columnMap = {} // array of each event's column by name; e.g. column-indexed object
    events.forEach((event) => {
      Object.keys(event).forEach((colName) => {
        columnMap[colName] = columnMap[colName] || []
        columnMap[colName].push(event[colName])
      })
    })
    resultObject[objKey]['columnMap'] = columnMap
  })


  // then calculate data for the object based on event data in the list of events
  // Object.keys(resultObject).forEach((key) => {
  //   let value = resultObject[key]
  // })


  return resultObject
}






















// 
//  Cytosis-specific transformers
// 



/*

  Transforms results of Cytosis (Array) to a keyed object (based on config),
  or into a flat object similar to [transformFlattenKeyedObject], but is cytosis specific;

  original:
  { 
    key1: { ... k1data },
    key2: { ... k2data }
  }

  flat: {
    ...k1data,
    ...k2data,
  }
 
  if prefix turned on: {
    ...key1_k1data,
    ...key2_k2data,
  }

*/
export const outputObject = (sourceData, { flatten, usePrefix, divider = "_" } = {}, sources) => {
  let data = {}
  sources.map((src, i) => {
    if (flatten) {
      if(usePrefix) {
        Object.keys(sourceData[i]).forEach((k) => {
          sourceData[i][`${src.name}${divider}${k}`] = sourceData[i][k]
          delete sourceData[i][k]
        })
      }
      data = { ...data, ...sourceData[i] }
    } else
      data[src.name] = sourceData[i]
  })
  return data
}












export const transformerMap = {
  transformRemap,
  transformArrayToObjectByKey, transformFlattenKeyedObject,
  scrapeKey, scrapeArray,
  transformArrayVersionedObjects,

  // Ramda / Polymerase transformers
  transformDataBySchema,
  transformUnstructuredTextKey, transformUnstructuredTextKeyArray,

  // event rollups / calculators
  rollupEventsArrayToObjectByKey,

  // llm prompts
  llmKeyPrompt, llmArrayPrompt,

  // cytosis transformers
  outputObject,
};
