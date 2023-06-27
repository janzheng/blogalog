

import * as R from 'ramda'; 

export const mapKeys = (fn, obj) => {
  return R.reduce((acc, key) =>
    R.assoc(fn(key), obj[key], acc),
    {}, R.keys(obj));
}


export const applyTransformers = (results, transformers) => {
  if(!transformers || !Array.isArray(transformers))
    return results

  for (const transformer of transformers) {
    const transformerFunction = transformerMap[transformer.function];
    results = transformerFunction(results, transformer.settings);
    console.log('[applyTransformers] ----->', results, transformer.function, transformer.settings)
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










const transformerMap = {
  transformRemap,
  transformArrayToObjectByKey
};
