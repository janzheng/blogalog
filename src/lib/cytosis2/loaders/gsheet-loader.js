/* 

  Loads content from a public Google Sheet, via link
  
    {
      "name": "bacteria",
      "type": "gsheet",
      "transformers": [
        {
          "function": "transformRemap",
          "settings": {
            "remap": {
              "Name": "Strain"
            }
          }
        },
        {
          "function": "transformArrayToObjectByKey",
          "settings": {
            "objectKey": "Strain"
          }
        }
      ],
      "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRuYa2r5lzHYSrU88gC4xnJyQzl9YA1VvUKvzmyvRJOA8PcEMfN085uWFvBsDzvZYeq-vOeJ_cZMGvm/pub?gid=281070310&single=true&output=csv"
    },


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



