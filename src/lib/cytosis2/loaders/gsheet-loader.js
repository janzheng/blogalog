/* 



*/


import csv from 'csvtojson'
import { applyTransformers, transformArrayToObjectByKey, transformRemap } from '../transformers/index.js'

export const gsheetLoader = async (src) => {
  let results = []

  const response = await fetch(src.url);
  const csv_text = await response.text();
  results = await csv().fromString(csv_text)

  results = applyTransformers(results, src.transformers)

  return results
}



