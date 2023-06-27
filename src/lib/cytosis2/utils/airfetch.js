/*

    airfetch.js

    - wrappers and helpers for cytosis
    - flattenRecord / flattenTable; ability to turn off cache on tables

    last updated: 2/5/2022

*/



// import Cytosis from 'cytosis';
import Cytosis from './cytosis.js';
import { cacheSet, cacheCheck } from "./cache.js"

import { config } from "dotenv"
config(); // https://github.com/sveltejs/sapper/issues/122


// NOTE: These need to be set @ the project-level .env
// these are the same across all projects - todo: use a settings object as a reference or something
const view = process.env.STATUS == 'Preview' ? "Preview" : "Published"
const apiEditorKey = process.env.AIRTABLE_PRIVATE_API
const baseId = process.env.AIRTABLE_PRIVATE_BASE


// adapters and linkers will have problems with this
export const cytosis = Cytosis
// export const cytosis = (Cytosis && Cytosis.default) || Cytosis 


/* 

  getContent is meant to load + cache the basic site content
  - uses Airtable as CMS

  Cache Strategies
  process.env.CACHE:
  = Loader: use loader.js-loaded json files instead of airtable
  = Memory or blank: in-memory caching (on first visit; needs clearing sometimes)
  = NoCache: no in-memory caching at all

  Loader is an at-build mechanism to Airtable and Notion data into .json files
  TODO: Implement Loader using Evergreen / PGH:O code
  For Loader to work on Vercel, must override cmd to `npm run loadbuild`  

  "bases" defines what table to get what content from
  let bases = [{
    tables: ["Content"],
    options: {
      "view": view,
    }
  }, {
    tables: ["Schedule"],
    options: {
      "view": view,
    }
  }, {
    tables: ["Profiles"],
    options: {
      "view": view,
    }
  }, {
    tables: ["Events"],
    options: {
      "view": view,
    }
  }
  ]
*/


export const getContent = async (
  bases = [{
    tables: ['Content'],
    options: { 'view': view }
  }],
  useCache = true,
  flatten = false,
  settings = null
  // jsonLocation = '../../../static/data/content.json'
) => {

  // let content
  try {
    // content = require(jsonLocation)
  } catch (err) { // do nothing if file doesn't exist // _err(err)
    console.error('[getContent]:', err)
  }

  // console.log('[Content] Cache Mode:', process.env.CACHE)

  // if (process.env.CACHE && process.env.CACHE == 'Loader' && content) {
  //   console.log('[Content] -- Loader Mode')
  //   // TODO: create Notion + Airtable compatible return schema; as a wrapper
  //   return content // json file should be in form of cytosis.results  
  // } else {
  //   console.log('[Content] Using Airtable as CMS')
  // }

  let tables = await getTables(bases, useCache, settings)
  if (flatten) {
    tables = flattenTables(tables)
  }
  return tables
}














// check if a field (e.g. email) exists in the Email field in a specified
// for not adding duplicates
export const checkExistence = async (keyword, tableName, fieldName = "Email", useCache = true, _apiEditorKey) => {
  const _cache = `checkExistence-${keyword}-${tableName}-${fieldName}`
  if (useCache && cacheCheck(_cache)) return cacheCheck(_cache)

  const cytosis = await new Cytosis({
    apiKey: _apiEditorKey || apiEditorKey,
    baseId: baseId,
    bases: [
      {
        tables: [tableName],
        options: {
          "maxRecords": 1,
          keyword: `${keyword}`,
          matchKeywordWithField: fieldName,
          matchStyle: 'exact',
        }
      },
    ],
    routeDetails: '[api/getters/checkExistence]',
  })
  if (cytosis.results[tableName].length > 0) {
    const record = cytosis.results[tableName][0]

    // if (useCache)
    cacheSet(_cache, record) // short cache to pings
    return record
  }
  return null
}

// future name of checkExistence
// keyword: e.g. "jan@phage.directory"
// tableName: e.g. "Profiles"
// fieldName: e.g. "Email"
export const getRecord = async (keyword, tableName, fieldName, useCache) => {
  return checkExistence(keyword, tableName, fieldName, useCache)
}

export const getRecord_v2 = async ({ keyword, tableName, fieldName, useCache = false, _apiEditorKey, _baseId }) => {
  const _cache = `getRecord_v2-${keyword}-${tableName}-${fieldName}`
  if (useCache && cacheCheck(_cache)) return cacheCheck(_cache)

  const cytosis = await new Cytosis({
    apiKey: _apiEditorKey || apiEditorKey,
    baseId: _baseId || baseId,
    bases: [
      {
        tables: [tableName],
        options: {
          "maxRecords": 1,
          keyword: `${keyword}`,
          matchKeywordWithField: fieldName,
          matchStyle: 'exact',
        }
      },
    ],
    routeDetails: '[api/getters/getRecord_v2]',
  })
  if (cytosis.results[tableName].length > 0) {
    const record = cytosis.results[tableName][0]

    // if (useCache)
    cacheSet(_cache, record) // short cache to pings
    return record
  }
  return null
}

export const getRecordById = async ({ recordId, tableName, useCache = false, _apiEditorKey, _baseId }) => {
  const _cache = `getRecordById-${recordId}-${tableName}`
  if (useCache && cacheCheck(_cache)) return cacheCheck(_cache)

  let record = await Cytosis.getRecord({
    recordId: recordId,
    tableName: tableName,
    apiKey: _apiEditorKey || apiEditorKey,
    baseId: _baseId || baseId,
  })
  record = flattenRecord(record)

  // if (useCache)
  cacheSet(_cache, record) // short cache to pings

  return record
}





// export const getRecordFromTables = async (keyword, tables, fieldName = "Email", useCache = true) => {
//   const _cache = `checkExistence-${keyword}-${tableName}-${fieldName}`
//   if (useCache && cacheCheck(_cache)) return cacheCheck(_cache)

//   const cytosis = await new Cytosis({
//     apiKey: apiEditorKey,
//     baseId: baseId,
//     bases: [
//       {
//         tables, // ["Abstracts", "Reviewers"]
//         options: {
//           "maxRecords": 1,
//           keyword: `${keyword}`,
//           matchKeywordWithField: fieldName,
//           matchStyle: 'exact',
//         }
//       },
//     ],
//     routeDetails: '[api/getters/checkExistence]',
//   })
//   if (cytosis.results[tableName].length > 0) {
//     const record = cytosis.results[tableName][0]
//     cacheSet(_cache, record) // short cache to pings
//     return record
//   }
//   return null
// }


// let kw = await getTable('Keywords', { view: 'Sorted' })
export const getTable = async (tableName, options, useCache = true, _apiEditorKey, _baseId) => {

  const _cache = `getTable-${tableName}-${JSON.stringify(options)}`
  if (useCache && cacheCheck(_cache)) return cacheCheck(_cache)

  const cytosis = await new Cytosis({
    apiKey: _apiEditorKey || apiEditorKey,
    baseId: _baseId || baseId,
    bases: [
      {
        tables: [tableName],
        options
      },
    ],
    routeDetails: '[api/getters/getTable]',
  })

  // if (useCache)
  cacheSet(_cache, cytosis.results[tableName]) // short cache to pings

  return cytosis.results[tableName]
}



export const getTablePaged = async (
  pageSize, tableName, options, useCache = true, _apiEditorKey, _baseId
) => {

  // const _cache = `getTablePaged-${pageSize}-${tableName}-${JSON.stringify(options)}`
  let _cache = `getTablePaged-${tableName}-${JSON.stringify(options)}`

  console.log('cache:', _cache)
  let pageObj = {}
  if (useCache && cacheCheck(_cache)) {
    pageObj = cacheCheck(_cache)
  }

  // console.log('!! pageSize:', pageSize)
  // if(pageObj) {
  //   console.log('cache pageObj:', pageSize, pageObj, pageObj.curPage)
  if (pageSize && pageSize < pageObj.curPage) {
    return {
      ...pageObj,
      results: pageObj.results.slice(0, pageSize * 100) // each page is 100 results
    }
  }
  // }

  if (!pageObj) {
    await new Promise((resolve, reject) => {
      cytosis.getPageTable({
        apiKey: _apiEditorKey || apiEditorKey,
        baseId: _baseId || baseId,
        tableName,
        options,
      }, (page) => {

        // if (useCache)
        cacheSet(_cache, page) // short cache to pings

        pageObj = page
        pageObj.curPage = 1
        resolve(pageObj)
      })
    })
  }

  if (pageObj && pageObj.getNextPage && pageSize > 1) {
    let curPage = pageObj.curPage || 1
    while (curPage < pageSize) {
      await new Promise((resolve, reject) => {
        pageObj.getNextPage().then(({ results, isDone }) => {
          pageObj.results = results
          curPage++
          if (isDone)
            pageObj.isDone = isDone
          pageObj.curPage = curPage
          resolve(pageObj)
        })
      })
    }
  }

  return pageObj
}





// TODO: getTables which takes bases[] definitions
/* 
  note: "bases" should really be "tables"

  let bases = [{
      tables: ["Content"],
      options: {
        "view": view,
      }
    }, {
      tables: ["Schedule"],
      options: {
        "view": view,
      }
    }, {
      tables: ["Profiles"],
      options: {
        "view": view,
      }
    }, {
      tables: ["Events"],
      options: {
        "view": view,
      }
    }
  ]

  let tables = getTables(bases)

  return value is an Object with table names as Keys
*/
export const getTables = async (bases = [{
  tables: ['Content'],
  options: { 'view': view },
  flatten: false,
}], useCache = true, settings) => {

  const _cache = `getTables-${view}-${JSON.stringify(bases)}-${JSON.stringify(settings)}`
  if (useCache && cacheCheck(_cache)) return cacheCheck(_cache)

  let _result = await new Cytosis({
    apiKey: settings?._apiEditorKey || apiEditorKey,
    baseId: settings?._baseId || baseId,
    bases: bases,
    routeDetails: '[airfetch/getTables]',
  })

  // console.log('[airfetch/getTables] _result:', _result)

  // if(useCache)
  // always set the new cache, even if not using
  cacheSet(_cache, _result.results)

  return _result.results
}





// tableName: name of table
/* examples of Payload (partial/translation of the data obj)

  ** if recordId given, will overwrite existing record instead! 

  payload: {
    'Message': data['comment'],
    'Attendee': data['recordId'] ? [data['recordId']] : null,
  }

  payload: {
    'Name': data['name'],
    'Type': data['questiontype'],
    'Topic': data['topic'],
    'Email': data['email'],
    'Question': data['comment'], 
    'Attendee': data['recordId'] ? [data['recordId']] : null,
  }

*/
export const addRecord = async (tableName, payload, recordId = null, tableOptions, _apiEditorKey, _baseId) => {

  const record = await cytosis.save({
    apiKey: _apiEditorKey || apiEditorKey,
    baseId: _baseId || baseId,
    tableName: tableName,
    recordId,
    tableOptions,
    payload
  })

  return record
}


export const addRecord_v2 = async ({
  tableName, payload, recordId = null, tableOptions,
  _apiEditorKey = apiEditorKey,
  _baseId = baseId,
}) => {

  const record = await cytosis.save({
    apiKey: _apiEditorKey,
    baseId: _baseId,
    tableName: tableName,
    recordId,
    tableOptions,
    payload
  })

  return record
}



// if record exists (based on the keyword and field name), add to existing one, otherwise create a new
export const saveRecord = async ({ keyword, fieldName }, tableName, payload, tableOptions = { insertOptions: ['typecast'] }) => {

  let cytosis, recordId
  let existing = await checkExistence(keyword, tableName, fieldName)
  if (existing) {
    recordId = existing.id
  }

  cytosis = addRecord(tableName, payload, recordId, tableOptions)

  return cytosis
}





// takes a cytosis.results['table'] and flattens the '.fields' into the objects. Keeps .id (can get)
export const flattenTable = (table) => {
  let newtable = []
  // clean up the cytosis table by only keeping id, fields, and basics of _table
  table.map(record => {
    newtable.push(flattenRecord(record))
  })
  return newtable
}

// flattens many tables, as returned by getContent / getTables
export const flattenTables = (tables) => {
  let flatTables = {}
  Object.keys(tables).forEach((table) => {
    flatTables[table] = flattenTable(tables[table])
  })
  return flatTables
}

export const flattenRecord = (record) => {
  return {
    ...record.fields,
    id: record.id,
  }
}





// checks against unhashed animal names
// future: check against hashed animal names, real passwords, etc.
/* Usage

  let user = await checkPassword({
    id: formJson.Username, 
    idField: "Slug", 
    plaintextPass: formJson.Password,
    passField: "Passphrase"
  })
  
  if(!user) {
    return {
      success: false,
      error: "Invalid username or password",
    }
  }

*/
// import { comparePasswords } from "$plasmid/utils/auth/auth-helpers"
// export const checkPassword = async ({
//   id,
//   idField = "Name",
//   plaintextPass,
//   passField = "Passphrase",
//   tableName = "People",
//   _apiEditorKey,
//   _baseId,
// }, isHashed = true) => {

//   try {

//     // find the user
//     let record = await getRecord_v2({
//       keyword: id,
//       tableName: tableName,
//       fieldName: idField,
//       _apiEditorKey: _apiEditorKey || apiEditorKey,
//       _baseId: _baseId || baseId,
//       useCache: false,
//     })

//     if (!record)
//       return false

//     record = flattenRecord(record)

//     // console.log('CHECKING -->>> :', record[passField], plaintextPass)
//     // check against hashed password if plaintext isn't matching
//     if (isHashed && record[passField] && plaintextPass && await comparePasswords(plaintextPass, record[passField])) {
//       return record
//     }

//     // check if the user has a passphrase in the passField field w/o hash
//     if (record[passField] && record[passField] == plaintextPass) {
//       return record
//     }

//     // return record if the passphrase matches
//     return false
//   } catch (err) {
//     console.error('[checkPassword] error:', err?.message || err)
//     // return { error: err?.message || err }
//     return false
//   }
// }











// 
//  API functions
// 

/*  
  wrapper for getContent for SvelteKit API get
  paste this as api/content.js:

  // gets content from the Content table
  import { getSiteContent } from '@plasmid/utils/airfetch'
  export const get = getSiteContent // sveltekit post api

*/

export const getSiteContent = async () => {
  let content = await getContent([{
    tables: ['Content'],
    options: { 'view': view }
  }])

  return { body: content }
}

export const getFlatSiteContent = async () => {
  let content = await getSiteContent()
  return { body: { Content: flattenTable(content.body.Content) } }
}


// takes a {url, tableName, fieldName} object and attempts to insert that into an airtable location as an attachment
export const postToAirtable = async ({ request }) => {
  const data = await request.json()

  const record = await addRecord(
    data.tableName,
    { [data.fieldName]: [{ url: data.url }], },
    null,
    { insertOptions: ['typecast'], },
  )

  return {
    body: record,
  };

};

