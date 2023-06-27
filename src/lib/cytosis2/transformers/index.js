

import * as R from 'ramda'; 

export const mapKeys = (fn, obj) => {
  return R.reduce((acc, key) =>
    R.assoc(fn(key), obj[key], acc),
    {}, R.keys(obj));
}


export const applyTransformers = (results, transformers, sources) => {
  if(!transformers || !Array.isArray(transformers))
    return results

  for (const transformer of transformers) {
    const transformerFunction = transformerMap[transformer.function];
    results = transformerFunction(results, transformer.settings, sources);
    // console.log('[applyTransformers] ----->', results, transformer.function, transformer.settings)
  }

  return results
}



// returns an array remapTransformResults
export const transformRemap = (results, {remap, oneKeyDeep}) => {
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
export const transformArrayToObjectByKey = (results, {objectKey}) => {
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



// 
//  Cytosis-specific transformers
// 



/*

  outut

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
  transformArrayToObjectByKey,
  outputObject,
};
