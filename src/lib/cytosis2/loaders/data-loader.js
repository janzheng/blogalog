
/* 

  Returns anything in the "data" field as data. Don't overthink it

*/


import { applyTransformers } from '../transformers/index.js'


export const dataLoader = async (src) => {
  if (src.data) {
    let results

    // check if text
    if (typeof src.data === 'string') {
      try {
        results = src.data.split('\n').map(line => JSON.parse(line))
      } catch (error) {
        try {
          results = JSON.parse(src.data)
        } catch (error) {
          results = src.data
        }
      }
    }

    // check if object w/ Object.keys
    else if (typeof src.data === 'object' && Object.keys(src.data).length > 0) {
      results = src.data
    }

    // check if array
    else if (Array.isArray(src.data)) {
      results = []
      for (const item of src.data) {
        // check if text
        if (typeof item === 'string') {
          try {
            results.push(JSON.parse(item))
          } catch (error) {
            // handle error
            results.push(item)
          }

          try {
            results.push(src.data.split('\n').map(line => JSON.parse(line)))
          } catch (error) {
            try {
              results.push(JSON.parse(src.data))
            } catch (error) {
              results.push(src.data)
            }
          }
        }
        else if (typeof item === 'object' && Object.keys(item).length > 0) {
          results.push(item)
        }
        // handle other cases
        else {
          // handle error or ignore
        }
      }
    }
    results = applyTransformers(results, src.transformers)
    // if flat, don't wrap with "data: "
    if(src.flat) return results

    return {
      data: results,
      metadata: src.metadata
    }
  }
  return null
}
