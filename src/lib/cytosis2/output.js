
/* 

  based on airhangar.js and grabby.js
  - requires node 18+ since we're using import, not require 

  node ./src/lib/cytosis2/output.js ./cytosis.config.js ./cytosis-data.json


*/


// SETUP

import fetch from "node-fetch"
import fs from "fs"

import { endo } from './index.js';
import { config as dotenvconf } from "dotenv"
dotenvconf()

import { Parser } from '@json2csv/plainjs';
import { unwind, flatten } from '@json2csv/transforms';

const configFilePath = process.argv[2]
const outputFilePath = process.argv[3] || './cytosis-data.json'

console.log('Config file:', configFilePath);
console.log('Output file:', outputFilePath);

try {
  (async () => {
    let configFile = await import(configFilePath)
    let config = configFile.config
    console.log('Config: ', config)
    let results = await endo(config)

    if (outputFilePath.includes(".json"))
      saveJson(results, outputFilePath)

    if (outputFilePath.includes(".csv"))
      saveCsv(results, outputFilePath)
  })()
} catch (err) { // do nothing if file doesn't exist // _err(err)
  console.error('Error:', err)
}







// 
// HELPERS
// 

// save from fetch stream to file
const saveJson = async (data, path=outputFilePath) => {
  try {
    data['_createdDate'] = new Date()
    const fileStream = await fs.writeFileSync(path, JSON.stringify(data))
    console.log('[saveJson] Saved file at:', path)
  } catch (e) {
    console.error('[saveJson] error', e)
  }
};

const saveCsv = async (data, path = outputFilePath) => {
  try {
    const parser = new Parser();
    flatten({ objects: true, arrays: true });

    const csv = parser.parse(data);
    const fileStream = await fs.writeFileSync(path, csv)
    console.log('[saveCsv] Saved file at:', path)
  } catch (e) {
    console.error('[saveCsv] error', e)
  }
};
