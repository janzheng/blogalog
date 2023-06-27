

import csv from 'csvtojson'
import { Client } from '@notionhq/client'
import Cytosis from 'cytosis'

import { cfnotionLoader } from './loaders/cfnotion-loader.js'
import { cfnotionPagesLoader } from './loaders/cfnotion-pages-loader.js'
import { notionLoader } from './loaders/notion-loader.js'
import { airfetchLoader } from './loaders/airfetch-loader.js'
import { gsheetLoader } from './loaders/gsheet-loader.js'
import { jsonLoader } from './loaders/json-loader.js'
import { csvLoader } from './loaders/csv-loader.js'
import { apiLoader } from './loaders/api-loader.js'
import { linksLoader } from './loaders/links-loader.js'



export const endo = async (config, {
  sourceNames, // = ['jz-data'],
}={}) => {

  if (sourceNames && sourceNames.length>0) {
    config.sources = config.sources.filter(src => sourceNames.includes(src.name))
  }

  if (config.settings.sourceData) {
    let data = await import(config.settings.sourceData /* @vite-ignore */) 
    if(data && data.default) {
      return data.default
    }
  }

  console.log('[endo] Fetching data sources')
  let sources = config.sources
  let sourceData = await Promise.all(sources.map((src, i) => {
    console.log('[endo] >> item:', src.name, src.type)
    // cytosis2 versions
    // get notion from cloudflare-notion endpoint
    let asyncData
    if (src.type == 'cfnotion') {
      asyncData = cfnotionLoader(src)
    }
    if (src.type == 'cfnotion-pages') {
      asyncData = cfnotionPagesLoader(src)
    }
    if (src.type == 'airfetch') {
      asyncData = airfetchLoader(src)
    }
    if (src.type == 'gsheet') {
      asyncData = gsheetLoader(src)
    }

    // untested / WIP
    if (src.type == 'notion') {
      asyncData = notionLoader(src)
    }
    if (src.type == 'json') {
      asyncData = jsonLoader(src)
    }
    if (src.type == 'csv') {
      asyncData = csvLoader(src)
    }
    if (src.type == 'api') {
      asyncData = apiLoader(src)
    }
    if (src.type == 'links') {
      asyncData = linksLoader(src)
    }

    // todo
    // if (src.type == 'fuzzyface') {
    //   asyncData = fuzzyfaceLoader(src)
    // }


    return asyncData // 



  }))




  let data = {}
  console.log('[endo] Done fetching. Results >>> ', sources)
  sources.map((src, i) => {
    // console.log('--->', src.name, sourceData[i])
    if (config.settings?.mode == "flat")
      data = { ...data, ...sourceData[i] }
    else
      data[src.name] = sourceData[i]
  })
  
  // await saveJson(data) // only on build time
  console.log('[endo] Done fetching. Final Data >>> ', data)
  return data
}