
import csv from 'csvtojson'
import { applyTransformers, transformArrayToObjectByKey } from '../transformers/index.js'

export const csvLoader = async (src) => {

  let results = await csv().fromFile(src.inputs.path)
  
  // call transformers one by one
  // results = transformRemap(results, src.transformer)
  // results = transformArrayToObjectByKey(results, src.transformer)
  // call transformers using an array model
  results = applyTransformers(results, src.transformers)

  return results

}