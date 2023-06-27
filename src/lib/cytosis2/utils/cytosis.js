
/*

  WIP CYTOSIS

  10/4/2022: Added CONCATENATE() around all search terms to coerce numbers and rollups into strings

*/

import Airtable from 'airtable'


class Cytosis {

  // opts:
  // airtableApi: env.airtable_api,
  // airBaseId: env.airtable_base
  // 
  // automatically get tables on init, unless given tables
  // (getting tables is expensive, and might not always be required on init)
  // options is a temporary view for initializing the table
  constructor(opts) {

    const _this = this

    this.apiKey = opts.apiEditorKey || opts.apiKey // editorKey overrides regular key
    this.apiEditorKey = opts.apiEditorKey // admin / editor API, lets you save
    this.baseId = opts.baseId
    this.routeDetails = opts.routeDetails // "routeDetails" or other kind of identifier. Helps w/ debugging

    this.configObject = opts.configObject || undefined // store the latest config for cache, backup, or review
    this.bases = opts.bases || []
    this.tableOptions = opts.tableOptions || { view: "Grid view", keyword: undefined }

    this.configTableName = opts.configTableName || '_cytosis' // Airtable table that stores all the configs
    this.configName = opts.configName || undefined // row inside '_cytosis' that tells Cytosis what table(s) to grab
    this.getConfigOnly = opts.getConfigOnly || false // if true, doesn't get tables and only returns config

    // pagination is only really useful for retrieving a single table
    // for multiple tables, just use two cytosis objects
    this.currentPage = opts.currentPage || 0 // pulls all pages as default
    this.pageDelay = opts.pageDelay || 150
    this.cacheDuration = 1000 * 60 * 60 * 1 // ttl, 1 hour cache — used to prevent config from being pulled a lot
    this.tablesLoaded = [] // used by pagination to indicate if each table has finished loading


    // caching
    this.useConfigCache = opts.useConfigCache == false ? false : true // tries a cache strat for config if true
    this.cacheStrategy = opts.cacheStrategy || 'localStorage'
    this.configCacheId = opts.configCacheId || undefined  // this is normally set in the cache fn


    // these are set by the _config ('_cytosis') table
    // if you provide bases, it'll skip the _config

    this.flat = opts.flat || false // for flattening {results, id} into a single obj: {..results, record_id}
    this.verbose = opts.verbose || false // for verbose logging
    this.endpointUrl = opts.endpointUrl

    this.results = {}
    this._lastUpdated



    // configs
    this.debug = opts.debug || undefined  // this is normally set in the cache fn

    if (this.debug)
      console.log(this)

    // if no query, we just return this object
    // if(!_this.configName) {
    //   return this
    // }


    // return a promise if the callee needs to do something w/ the result
    return new Promise(function (resolve, reject) {
      // first retrieve the _cytosis table of tables

      // load config + data if given a configName
      // this loads the 
      Cytosis.initCytosis(_this).then((loaded) => {

        // only return config and don't load tables
        if (_this.getConfigOnly) {
          resolve(_this)
          return
        }

        if (loaded) {
          if (_this.verbose)
            console.log('[Cytosis] _cytosis initiated:', _this.bases)
          // then retrieve the actual data

          Cytosis.loadCytosisData(_this).then((newCytosis) => {
            resolve(newCytosis)
          }, (err) => {
            reject(new Error(err))
          })
        } else {
          reject(new Error(`[Cytosis/init] Cytosis failed to initialize`))
        }
      }, (err) => {
        reject(new Error(`[Cytosis/init] Cytosis initialization error: Couldn't setup Config ('_cytosis'). Make sure your Base has a config table, e.g. a table named '_cytosis' with the views configured!`, err))
      })
    })
  }


  /*





    Methods





  */


  // Internal


  find(findStr, fields = ['Name']) {
    return Cytosis.find(findStr, this.results, fields)
  }

  // getRemote (recordId) {
  //   // finds remotely maybe break this out in a different fn or run it
  //   // if not found locally?
  //   // base(table).find(recordId, function(err, record) {
  //   //   if (err) { 
  //   //     console.log('No record found? ' , record)
  //   //     console.error(err) return 
  //   //   }
  //   //   console.log('Record found: ' , record)
  //   //   resolve(record)
  //   // })
  // }





  // AIRTABLE MODIFIERS

  // — these require API key w/ write permission or they'll fail
  save(object, tableName, recordId = undefined) {
    return Cytosis.save(object, tableName, this, recordId)
  }

  // new model
  saveArray(objectArray, tableName, create = false, typecast = false) {
    return Cytosis.saveArray(objectArray, tableName, this, create, typecast)
  }

  delete(tableName, recordId) {
    return Cytosis.delete(tableName, this, recordId)
  }

  saveLinkedTable(stringList, targetTableName, sourceTable, colName = 'Name') {
    return Cytosis.saveLinkedTable(stringList, targetTableName, sourceTable, this, colName)
  }



  /*






    Static Methods
      - Helpers that make life easier / faster





  */

  // Input: base ID (from airtable)
  // Output: Airtable base object
  static getBase(apiKey, baseId, endpointUrl = 'https://api.airtable.com') {
    // console.log('getBase:', apiKey, baseId, endpointUrl)
    Airtable.configure({
      endpointUrl,
      apiKey,
    })

    return Airtable.base(baseId)
  }

  static preCheck({ apiKey, baseId }, bases = undefined) {
    if (bases) {
      // give a pass; might do more rigorous checking later
      return true
    }

    if (apiKey && baseId)
      return true

    throw new Error('[Cytosis/precheck] Please provide an API key and Base ID')
    // return false
  }

  // Get an object of airtable objects
  // NOTE: this is the ONLY function that pulls from Airtable API!
  // 
  // use map/get for useful data: list.map(e => (`${e.id} ${e.get('Name')}`))
  // filter is an airtable filter formula https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference
  // no default sort: '[{field: 'Name', direction: 'asc'}]'
  // Input: 
  //    options: airtable API options {view, fields, sort, filter}
  //    cytosis: cytosis object (with base, apiKey, etc.)
  //    tables: array of table names ['tableOne','tableTwo', ...]
  // Output: 
  //    creates object of airtable table record arrays
  //    sets this.results to the object (overwrites any previous tables)
  //    returns the object
  // 
  //    this.results = {
  //      tableOne: [record object, record object, ...]
  //      ...
  //    }
  // getTables (options={}, tables=this.tableNames ) {
  // static getTables ({options, tables=this.tableNames}) {
  /*
      bases is built from a config file, or can be sent in directly looks like:
      [{
        query: "content-1",
        tables: ["Site Content"],
        options: {
          fields: undefined,
          filter: undefined,
          maxRecords: 1,
          pageSize: undefined,
          sort: undefined,
          view: "content-1--view",
          matchKeywordWithField: undefined,
          matchStyle: undefined,
        }
      }]


  */
  static getTables({ cytosis, bases, routeDetails }) {

    bases = bases || cytosis.bases

    let pTables = [] // tables (promise)

    // need to follow these defaults for airtable:
    // view='', fields=undefined, sort=undefined, filter='', 

    if (!Cytosis.preCheck(cytosis, bases))
      return {}


    // returns a promise from airtable
    const airtableFetch = function ({ base, tableName, filterObj, list }) {
      // console.log('[Cytosis] fetching table:', table, 'from', cytosis.baseId)


      return new Promise(function (resolve, reject) {
        let timedFetcher

        base(tableName).select(
          filterObj
        ).eachPage(function page(records, fetchNextPage) {
          // console.log('[Cytosis] Page Fetch for:', tableName, 'routeDetails:', routeDetails, 'page:', cytosis.currentPage, filterObj, records)
          cytosis.currentPage += 1
          // This function (`page`) will get called for each page of records.
          records.forEach(function (record) {
            // console.log('record:', record, list[list.length-1])
            list = [...list, Cytosis.cleanRecord(record, cytosis.flat)]
          })

          timedFetcher = setTimeout(fetchNextPage, cytosis.pageDelay)

        }, function done(err) {
          clearTimeout(timedFetcher)

          if (err) {
            console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error @routeDetails:', routeDetails)
            console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error [2]', 'Errored on table:', tableName, 'bases:', bases)
            console.error('[Cytosis/getTablePromise/airtableFetch] Airtable Fetch Error >> error message:', err)

            // experiment with erroring silently
            // reject(err)
            reject(new Error("[Cytosis/getTablePromise/airtableFetch] No response from Airtable"))
            // return
          }

          cytosis.tablesLoaded = [...cytosis.tablesLoaded, tableName] // indicate this table's done loading
          resolve({ [tableName]: list })
        })

      })
    }

    const getTablePromise = function ({ tableNames, options, apiKey, baseId }) {
      try {


        for (let tableName of tableNames) {
          // for (let tableName of !cytosis.tablesLoaded.includes(tableNames)) {

          let filterObj = Cytosis.getFilterOptions(options, tableName)

          let list = []

          if (cytosis.tablesLoaded.includes(tableName)) {
            // only process tables that haven't finished loading yet
            continue
          }

          // console.log('[Cytosis/getTables] Retrieving:', tableName)
          // table of promises
          pTables.push(airtableFetch({
            base: Cytosis.getBase(apiKey, baseId), // airtable base object
            tableName,
            filterObj,
            list,
          }))
        }

      } catch (e) {
        console.error('[Cytosis/getTables/getTablePromise] Airtable caught general error', e) // return 
        throw new Error(e)
      }
    }


    bases.map((base) => {
      // need to slow it down
      // setTimeout(function(){

      getTablePromise({
        tableNames: base.tables, // array of strings 
        options: base.options || {},
        apiKey: base.apiKey || cytosis.apiKey,
        baseId: base.baseId || cytosis.baseId
      })
      // }, 200)
    })

    try {
      return Promise.all(pTables).then((tables) => {

        let finalObj = {}

        for (let table of tables) {
          // finalObj = { ...finalObj, ...t, ...cytosis.data }
          finalObj = { ...finalObj, ...table }
        }
        // _this.airtable = finalObj
        // _this.results = finalObj

        if (tables.length == 0) {
          console.warn(`[Cytosis/getTables] No tables found for your table configuration. Please check your configName, views, and filters for base:`, base)
        }

        // console.log('getTables returning:', finalObj, tables)
        return finalObj // return as a one promise object
      }, (err) => {
        console.error("[Cytosis/getTables] A table errored out or timed out: ", err)
        // return Error("[Cytosis/getTables] Fetch Error")
        return Promise.reject(new Error("[Cytosis/getTables] Fetch Error"))
      })
    } catch (err) {
      console.error("[Cytosis/getTables/pTablesPromiseHandling] An Airtable table errored out", err)
    }



  }





  // "paginate" through a table by getting more
  // airtable doesn't support real pagination (no max #, page #, offset)
  // base: {
  //   tableNames: base.tables, // array of strings — only takes the FIRST one listed
  //   options: base.options || {},
  //   apiKey: base.apiKey
  //   baseId: base.baseId
  // }
  // only cytosis necessary
  static getPageTable({ cytosis, routeDetails, apiKey, baseId, tableName, options }, callback) {

    const base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId) // airtable base object

    // only use the first attached table, otherwise pagination will be annoying
    if (!tableName)
      if (cytosis.bases[0].tables[0])
        tableName = cytosis.bases[0].tables[0]
      else
        throw new Error('[Cytosis/getPageTable] Please give a table name for pagination')

    const filterObj = Cytosis.getFilterOptions(options || cytosis.bases[0].options)
    let results = []
    let currentPage = 0
    let isDone = false

    // note, returning a promise interferes with done(),
    // so we must use a callback
    // return new Promise(function(resolve, reject) {
    const baseSelect = base(tableName).select(
      filterObj
    )

    let fetchResolve, lastBatch

    baseSelect.eachPage(function page(records, fetchNextPage) {
      // console.log('[Cytosis] Page Fetch for:', tableName, 'routeDetails:', routeDetails, 'page:', currentPage, filterObj, records)
      currentPage += 1

      // check if record exists (paging doesn't trigger 'done'
      // if we use a promise)
      if (lastBatch && lastBatch[0].id === records[0].id) {
        isDone = true
      }

      if (!isDone) {
        lastBatch = records
        records.forEach(function (record) {
          let flat = cytosis && cytosis.flat ? cytosis.flat : false
          results = [...results, Cytosis.cleanRecord(record, flat)]
        })
      }

      if (fetchResolve)
        fetchResolve(results)

      callback({
        results,
        isDone,
        getNextPage: async () => {
          if (!isDone) {
            let results = await new Promise((_resolve, _reject) => {
              fetchResolve = _resolve
              try {
                fetchNextPage()
              } catch (e) {
                console.error('fetchNextPage err', e)
                return
              }
            })
            // getNextPage(fetchNextPage) 
          }

          return {
            results,
            isDone
          }
        },
      })

      // auto fetches everything
      // fetchNextPage()

      // can't use a promise
      // resolve({
      // results,
      // isDone,
      // getNextPage: async () => { 
      //   if(!isDone) {
      //     let results = await new Promise((_resolve, _reject) => {
      //       fetchResolve = _resolve
      //       fetchNextPage()
      //     })
      //     // getNextPage(fetchNextPage) 
      //   }

      //   return {
      //     results,
      //     isDone
      //   }
      // },
      // })

    }, function done(err) {

      if (err) {
        console.error('[Cytosis/getPageTable] Airtable Fetch Error @routeDetails:', routeDetails)
        console.error('[Cytosis/getPageTable] Airtable Fetch Error [2]', 'Errored on table:', tableName)
        console.error('[Cytosis/getPageTable] Airtable Fetch Error >> error message:', err)

        // experiment with erroring silently
        // reject(err)
        reject(new Error("[Cytosis/getPageTable] No response from Airtable"))
        // return
      }

      isDone = true
      // console.log('done!', results)

      callback({
        results,
        isDone,
      })

    })

    // })
  }











  // formerly internal init
  // formerly initConfig() initializes _config table from Airtable pulls from _cytosis if no init data
  // will overwrite current table data useful to rehydrate data
  // (but pulls in EVERYTHING from Airtable)
  // assumes you want to "reinitialize" with new data if passed 'false',
  // skips initialization if data already exists

  // if given bases will skip all of setup and presume we can pull from the Base
  // if given a configObject, we can pull the setup data from the config object 
  static initCytosis(cytosis) {
    // console.log('Starting cytosis', cytosis)
    const _this = cytosis

    if (_this.verbose)
      console.log('initializing from index: ', cytosis.configName)

    return new Promise(function (resolve, reject) {

      // if config exists, we skip retrieving _cytosis and go right to setup this saves some fetches
      if (_this.configObject) {
        // console.log('config found! skipping _cytosis', _this.config)
        // loadConfig sets the bases
        initFromConfig(_this.configObject)
        resolve(true)
        return
      }

      // if we provided tables, but don't have config, 
      // we still skip config — we just default to whatever options were passed in
      if (_this.bases && _this.bases.length > 0) {
        resolve(true)
        return
      }

      // if no config or tables setup, we grab config table
      if (!_this.configObject) {

        // if no table names are provided, it looked for a special '_cytosis' tab
        // this is required to initialize the Cytosis object

        // try the cache first
        if (_this.useConfigCache) {
          let _config = Cytosis.loadConfigCache(_this)
          if (_config) {
            console.log('[Cytosis/init] Config loaded from cache:', _config)
            _this.configObject = _config
            Cytosis.initFromConfig(_this, _config)
            resolve(true)
            return
          }
        }

        console.log('[Cytosis/init] Loading config from table:', _this.configTableName,)


        Cytosis.getTables({
          cytosis: _this,
          bases: [{
            tables: [_this.configTableName],
            options: {},
          }],
          routeDetails: `init-${_this.configTableName}-${_this.routeDetails}`,
        }).then((_config) => {

          if (!_config || _config[_this.configTableName].length == 0) {
            reject(new Error(`[Cytosis] — couldn’t find a reference table named ${_this.configTableName} in the base with reference field: :${_this.configName} or 'tables' filled out with the names of tables to load`))
          }

          if (_config) {
            Cytosis.initFromConfig(_this, _config)

            // sav config into cache if it's enabled
            if (_this.useConfigCache) {
              Cytosis.saveConfigCache(_this)
            }
          }

          // console.log('Cytosis tables: ', _this.airBase, _this.tableNames)
          // return the initiated cytosis object on completion
          resolve(true)
        }, (err) => {
          reject(new Error(`[Cytosis] Couldn't retrieve Config object from Airtable`, err))
        })
      }

    })
  }



  // used to be part of initCytosis — separated so configs can be passed in separately
  // this loads the config table into cytosis.configObject as an object
  // also fills out cytosis.options and cytosis.bases
  // output: it changes cytosis directly; doesn't return anything
  static initFromConfig(cytosis, _config) {
    cytosis.configObject = _config || cytosis.configObject // this needs to be the _cytosis array

    // console.log('initFromConfig....', _config, _config[cytosis.configTableName])
    // this requires a table named '_cytosis' with a row (configName) that indicates where the information is coming from
    // need column 'Tables' with a Multiple Select of all the table names in the base
    // (this is required b/c Airtable API won't let you get all table names)
    // init tables from config if they don't exist

    let getOptions = function (config) {
      // some queries can contain options like fields, sort, maxRecords etc.
      // these can drastically cut back the amount of retrieved data
      // note that options can be sent thru the _config table or code; the table takes
      // precedence for flexibility

      let options = {
        fields: config.fields['fields'] || cytosis.tableOptions['fields'], // fields to retrieve in the results
        filter: config.fields['filterByFormula'] || cytosis.tableOptions['filterByFormula'],
        maxRecords: config.fields['maxRecords'] || cytosis.tableOptions['maxRecords'],
        pageSize: config.fields['pageSize'] || cytosis.tableOptions['pageSize'],
        view: config.fields['view'] || cytosis.tableOptions['view'],

        keyword: config.fields['keyword'] || cytosis.tableOptions['keyword'], // used for filter searching
        keywords: config.fields['keywords'] || cytosis.tableOptions['keywords'], // used for filter searching
        matchCase: config.fields['matchCase'] || cytosis.tableOptions['matchCase'], // if true, only matches if case is the same; otherwise performs a LOWER()
        matchKeywordWithField: config.fields['matchKeywordWithField'] || cytosis.tableOptions['matchKeywordWithField'],
        matchKeywordWithFields: config.fields['matchKeywordWithFields'] || cytosis.tableOptions['matchKeywordWithFields'],
        matchStyle: config.fields['matchStyle'] || cytosis.tableOptions['matchStyle'], // how are keywords matched?
      }

      if (cytosis.tableOptions['sort']) {
        options['sort'] = cytosis.tableOptions['sort'] // needs to be of format : "{sort: [blahblah]}"

      }
      if (config.fields['sort']) {
        options['sort'] = JSON.parse(config.fields['sort']) // needs to be of format : "{sort: [blahblah]}"
      }

      return options
    }

    for (let config of _config[cytosis.configTableName]) {


      // Option 1: find all the options in the Tables list
      if (config.fields['Name'] == cytosis.configName && config.fields['Tables']) {
        let options = getOptions(config)

        // tables is an array of strings that say which tables (tabs) in Airtable to pull from
        // cytosis.bases = config.fields['Tables']
        // cytosis.tableOptions = options
        cytosis.bases = [{
          query: cytosis.configName,
          tables: config.fields['Tables'],
          options,
        }]
      }

      // Option 2: find all the tableQueries in the linkedQueries (this lets you pull in mulitple queries) list
      else if (config.fields['Name'] == cytosis.configName && config.fields['linkedQueries']) {
        const linkedQueries = config.fields['linkedQueries']
        // console.log('Linked Query Names: ', linkedQueries)

        // this is a special case where instead of an array of strings, it's an
        // array of objects {query (string), tables (array of strings), options (object)}
        let bases = []
        // for each linked query, find and store the correct query
        linkedQueries.map((linkedquery) => {
          _config._cytosis.map((query) => {
            if (linkedquery == query.fields['Name']) {
              let options = getOptions(query)
              console.log('linkedquery match:', linkedquery, query, options)

              // const options = {
              //   fields: query.fields['fields'], // fields to retrieve in the results
              //   filter: query.fields['filterByFormula'],
              //   maxRecords: query.fields['maxRecords'],
              //   pageSize: query.fields['pageSize'],
              //   sort: query.fields['sort'] ? JSON.parse(query.fields['sort'])['sort'] : undefined, // needs to be of format : "{sort: [blahblah]}"
              //   view: query.fields['view'],
              // }

              bases.push({
                query: linkedquery,
                tables: query.fields['Tables'],
                options: options
              })
            }
          })
        })

        cytosis.bases = bases
      }
    }
  }





  // wrapper / helper for getTables — just pass in a Cytosis object
  // used to be in the class initializer and pulled out
  // sets Cytosis' tables
  // sets the new results by object reference into cytosis; doesn't return anything
  static loadCytosisData(cytosis, append = false) {
    const _this = cytosis

    cytosis.tablesLoaded = [] // reset the tables loaded to allow for re-loading

    return new Promise((resolve, reject) => {
      Cytosis.getTables({
        cytosis: _this,
        bases: _this.bases,
        routeDetails: _this.routeDetails
      }).then((_results) => {
        if (append)
          _this.results = { ..._this.results, ..._results }
        else
          _this.results = _results

        _this._lastUpdated = new Date()
        resolve(_this)
      }, (err) => {
        reject(new Error(`[Cytosis/loadCytosisData] Retrieval error: Couldn't retrieve all tables from your Base. Please double check your 'tables' and 'views' column to make sure the table names match and corresponding views exist`, err))
      })

    })
  }










  // store config into a cache strategy
  static saveConfigCache(cytosis) {

    if (cytosis.useConfigCache == false)
      return false

    try {
      if (cytosis && cytosis.configObject && localStorage) {
        const configCacheId = cytosis.configCacheId || `config-${cytosis.baseId}`

        const now = new Date()
        const cacheItem = {
          value: cytosis.configObject,
          expiry: now.getTime() + cytosis.cacheDuration
        }

        console.log('[Cytosis/saveConfigCache] Caching config:', configCacheId, cytosis.configObject)
        localStorage.setItem(configCacheId, JSON.stringify(cacheItem));
        // const cacheId = cytosis
        return true
      }

      console.warn('[Cytosis/saveConfigCache] Config not cached; please provide a Cytosis object, and ensure it has a configObject set')
      return false
    } catch (e) {
      console.warn('[Cytosis/init/saveConfigCache] No localstorage available; skipping')
      return false
    }
  }

  // load config from a cache strategy
  static loadConfigCache(cytosis, configCacheId = null) {

    if (cytosis.useConfigCache == false)
      return false

    // will just fail silently on server
    try {

      if (cytosis)
        configCacheId = cytosis.configCacheId || `config-${cytosis.baseId}`

      // console.log('loading config cache..', cytosis, localStorage)

      // this will fail if running on server
      if (localStorage && configCacheId) {
        const cacheItem = localStorage.getItem(configCacheId)

        if (!cacheItem) {
          return null
        }

        const { value, expiry } = JSON.parse(cacheItem)
        const now = new Date()

        // compare the expiry time of the item with the current time
        // console.log('[Cytosis/loadConfigCache] Cache expires ', expiry.toLocaleString())
        if (now.getTime() > expiry) {
          localStorage.removeItem(configCacheId)
          return null
        }
        return value
      }
      console.warn('[Cytosis/loadConfigCache] Need to provide Cytosis object to clear cache')
      return null
    } catch (e) {
      console.warn('[Cytosis/init/loadconfigCache] No localstorage available; skipping')
      return false
    }
  }



  static resetConfigCache(cytosis) {

    if (cytosis.useConfigCache == false)
      return false

    try {
      if (cytosis && localStorage) {
        const configCacheId = cytosis.configCacheId || `config-${cytosis.baseId}`
        localStorage.removeItem(configCacheId)
        return truee
      }

      console.warn('[Cytosis/resetConfigCache] Need to provide Cytosis object to clear cache')
      return false
    } catch (e) {
      console.warn('[Cytosis/init/resetConfigCache] No localstorage available; skipping')
      return false
    }
  }


  // given options, this builds the filter object
  // required by airtableFetch and anything else that pulls data
  // from Airtable
  static getFilterOptions(options, tableName) {

    let { fields, sort, maxRecords, pageSize } = options
    let view = options.view || ''
    let filter = options.filter || ''

    // console.log('get Filter options:', tableName, options)

    // if matchKeywordWithField exists, and a keyword was passed into the cytosis options object,
    // we create a filterByFormula where the given keyword has to exist in the field
    // this is useful for matching articles by dynamic slug value, etc.
    if (options && options.keyword && options.matchKeywordWithField) {
      // this only works when there is an EXACT match
      // DEFAULT
      if (options.matchCase == true) {
        filter = `IF(CONCATENATE({${options.matchKeywordWithField}}) = "${options.keyword}",TRUE(),FALSE())`
      } else {
        filter = `IF(LOWER(CONCATENATE({${options.matchKeywordWithField}})) = LOWER("${options.keyword}"),TRUE(),FALSE())`
      }

      // this works when the string exists as a part
      // "exact" match is default so we don't have code for it
      if (options.matchStyle == "partial") {
        if (options.matchCase == true) {
          filter = `IF(SEARCH("${options.keyword}",CONCATENATE({${options.matchKeywordWithField}})) > 0,TRUE(),FALSE())`
        } else {
          filter = ` IF(SEARCH(LOWER("${options.keyword}"),LOWER(CONCATENATE({${options.matchKeywordWithField}}))) > 0,TRUE(),FALSE())`
        }
      }


      // note: you can't use Filter formula to SEARCH through a string separated arrays, so that's tabled for now
      // it has to be handled on an API, or as a rollup or "search" field on the Airtable itself that has all the text compiled into one field
      // console.log('matchKeywordWithField filter: ', filter, ' for', options.keyword, ' with', options.matchKeywordWithField, ' and match style', options.matchStyle)
    }

    // works like matchKeywordWithField but takes an array of fields and wraps if statements around an OR()
    // replaces matchKeywordWithField
    function keywordFilter(keyword) {
      let filters = []

      options.matchKeywordWithFields.map((fieldName) => {
        if (!fieldName) // exclude names that don't exist
          return

        if (options.matchCase == true) {
          filters.push(`IF(CONCATENATE({${fieldName}}) = "${keyword}",TRUE(),FALSE())`)
        } else {
          filters.push(`IF(LOWER(CONCATENATE({${fieldName}})) = LOWER("${keyword}"),TRUE(),FALSE())`)
        }

        // this works when the string exists as a part
        // "exact" match is default so we don't have code for it
        // "partial" means the keyword exists as a part of the string
        if (options.matchStyle == "partial") {
          if (options.matchCase == true) {
            filters.push(`IF(SEARCH("${keyword}",CONCATENATE({${fieldName}})) > 0,TRUE(),FALSE())`)
          } else {
            filters.push(`IF(SEARCH(LOWER("${keyword}"),LOWER(CONCATENATE({${fieldName}}))) > 0,TRUE(),FALSE())`)
          }
        }
      })

      filter = 'OR('
      filters.map((_filter, i) => {
        if (i > 0)
          filter += ','
        filter += _filter
      })
      filter += ')'
    }

    if (options && options.keyword && options.matchKeywordWithFields) {
      keywordFilter(options.keyword)
    }

    // multiple keywords will only work with `matchKeywordWithFields` option
    if (options && options.keywords && options.matchKeywordWithFields) {
      // console.log('advanced search:', options.keywords, options.matchKeywordWithFields)
      let filters = []
      options.keywords.map(keyword => {
        if (!keyword || keyword.trim().length == 0)
          return
        keywordFilter(keyword.trim()) // sets filter independently
        filters.push(filter)
      })
      filter = 'OR('
      filters.map((_filter, i) => {
        if (i > 0)
          filter += ','
        filter += _filter
      })
      filter += ')'
    }




    const filterObj = {
      filterByFormula: filter,
      view
    }

    if (sort) {
      filterObj['sort'] = sort // need to add this after-the-fact
    }

    if (maxRecords) {
      filterObj['maxRecords'] = maxRecords // limit # of records inclusive of all pages
    }

    if (pageSize) {
      filterObj['pageSize'] = pageSize // limit # of records for each page
    }

    if (fields && fields[tableName]) { // if a field for this table exists, add it (old structure, v1)
      filterObj['fields'] = fields[tableName]
    } else if (fields) { // new structure
      filterObj['fields'] = fields
    }

    return filterObj
  }








































  // Retrieves a single record from the stored tables object
  // Note: this only searches locally
  // 
  // replaced: getRecord (recordId)
  // Input: recordId (Airtable record ID, a string)
  // Output: a single record object
  static getById(recordId, tables) {
    // const base = this.getBase(this.baseId)
    // const tables = this.results // slice makes a shallow copy
    let result

    if (tables) {
      // return new Promise(function(resolve, reject) {
      // iterate through every table, but only one should resolve, since recordIds are unique
      // replace with async iterator in the future this is expensive since it does a fetch for EACH table
      Object.keys(tables).map((table) => {
        for (let record of tables[table]) {
          if (record.id == recordId) {
            // return record
            result = record
          }
        }
      })

      return result

      // reject() // nothing found
      // })
    }
    return undefined
    // return new Promise(function(resolve, reject) {
    //   reject(false)
    // })
  }


  // Retrieves a single record from Airtable
  // This performs a "base('TableName').find('recUKWFfOvY1lRwzM')"
  // 
  // Input: recordId (Airtable record ID, a string) / alternatively give it a base
  // Output: a single record object
  static async getRecord({ recordId, base, tableName, apiKey, baseId, endpointUrl }) {

    // console.log('getting record:', recordId)
    try {
      if (!tableName)
        throw new Error(`[Cytosis/getRecord] Please provide a table name`)

      if (!apiKey)
        throw new Error(`[Cytosis/getRecord] Please provide an apiKey`)

      if (!baseId)
        throw new Error(`[Cytosis/getRecord] Please provide a base ID`)

      if (!base) {
        base = Cytosis.getBase(apiKey, baseId, endpointUrl)
      }

      let record = await base(tableName).find(recordId)
      return Promise.resolve(record)
    } catch (err) {
      // nothing found
      console.error('[Cytosis/getRecord] Error:', err)
      return Promise.reject(err)
    }
  }








  // Will find a record within Cytosis.results, e.g. Cytosis.results = { TableOne: [ record, record, record], TableTwo: [ record, record, record ] } 
  // — it's a lot more efficient to require data to be pulled and cached rather than be pulled per find request
  // findStr = 'RowName' — (returns a record object!!) finds all items "RowName" inside the airtables object. Make sure Tables is the Cytosis.results >>>> RETURNS AN OBJECT
  // findStr = 'Content.Row Name' — (returns an array of records!!) finds all items "RowName" in the Content table. Tables needs to be an object where each key is the name of the table and pointing to arrays
  // findStr = 'Content.Row Name.ColName' — finds a specific ColName inside the Row and returns the results, e.g. if you have a URL column, it'll return the string
  //           if this is a linked record, it returns an array of records if it can find them with getById, otherwise it'll return an array of linked objects' record Id names)
  // findStr = 'Content.RowName.ColName.LinkedColName' — if a ColName contains links, LinkedColName refers to the field in the linked table. Very useful to get the names or other data
  // ex: cytosis.find('Content.slug', [this.cytosis.tables.Notes], ['Slug'])
  // - both RowName and ColName can contain spaces
  // * assumes Names are unique will return the first one found
  // 
  // Input:
  //    findStr: a specially formatted string used to retrieve data
  //    tables: an object of Airtable arrays, ex: { Tags: [records], Content: [records] }
  //    fields: an array of which fields (columns) to search in (an array of strings). Airtable's key field default is 'Name'
  // Output:
  //    if findStr is just a RowName, returns the first found // FUTURE: an array of results if many matches, or one result if only one found
  //    returns the field's contents, usually a string or array
  //    if the field is a link to another table, will return an array of recordIds
  // static find (findStr, tables=this.tables, fields=['Name']) {
  static find(findStr, tables, fields = ['Name']) {

    if (!findStr || !tables)
      return []

    if (typeof (fields) == "string") {
      console.error('[Cytosis/find] "fields" argument must be an array')
      return undefined
    }

    if (Array.isArray(tables) || Object.keys(tables) && Object.keys(tables).length == 0) {
      console.error('[Cytosis/find] "tables" needs to be an object that wraps your Table arrays, where each key is the name of the table, like so: {tableName: [records], tableName2: [records]}. If you use Cytosis, you can just pass in Cytosis.results. ')
      return undefined
    }

    // console.log('tables:', typeof(tables), Object.keys(tables), Array.isArray(tables), tables, fields)


    // match a single string against all columns (fields) in all objects
    function matchField(str, tables, fields) {
      let results = []

      // given an object...
      Object.keys(tables).map((table) => {
        // console.log('Matching', str, tables, fields, table, tables[table])
        // console.log('Current object format:', tables)

        if (!tables[table])
          throw new Error(`[Cytosis/Find] — Couldn’t find a match. Make sure you're looking in the right place. Reference table/string: (${tables[table]} / ${findStr}). Required Format was probably wrong: { Content: [ row, row, row], Tags: [ row, row, row ] }. `)
        // each airtable record
        for (let record of tables[table]) {
          for (let field of fields) {

            // check if field exists, and if the contents match
            if (record && record.fields && record.fields[field] && str == record.fields[field]) {
              // console.log('Match found in', record.fields.Name)
              results.push(record)
            }
          }
        }
      })
      return results
    }

    const queries = findStr.split('.')
    // console.log('Looking for', queries.join(', '), 'in', fields.join(), 'tables:', tables, queries.length)

    // when just looking for one value, match against the column (field) name
    if (queries.length == 1)
      return matchField(queries[0], tables, fields)[0] // return the FIRST result

    if (queries.length == 2)
      return matchField(queries[1], { q: tables[queries[0]] }, fields)

    // when queries > 2, we need to return the contents of the record's field, and not the record itself!
    // this is just implemented for 3 levels deep for testing
    const records = matchField(queries[1], { q: tables[queries[0]] }, fields)

    // return if it's a string or nonarray
    // assume Name is unique, otherwise complicated return first found
    if (!Array.isArray(records[0].fields[queries[2]])) {
      return records[0].fields[queries[2]]
    }

    // could be an array of IDs... or array of strings and images
    const fieldContent = records[0].fields[queries[2]]

    // 3 deep returns a field / column — if it's a linked field, we return the results
    // (if we can find them using getById)
    if (queries.length == 3) {
      let results = []
      // can't use getByIds b/c we have no idea where they come from
      // (we don't have the metadata — BUT we could do a getId though?)
      // const linkedRecords = Cytosis.getByIds(fieldContent, tables, true)
      for (let id of fieldContent) {
        const record = Cytosis.getById(id, tables)
        if (record)
          results.push(record)
      }
      if (results.length > 0) {
        return results
      }
    }

    // 4 deep returns the linked field's content, which we assume to be Ids
    if (queries.length == 4) {
      let results = []
      // can't use getByIds b/c we have no idea where they come from
      // (we don't have the metadata — BUT we could do a getId though?)
      // const linkedRecords = Cytosis.getByIds(fieldContent, tables, true)
      for (let id of fieldContent) {
        const record = Cytosis.getById(id, tables)
        results.push(record.fields[queries[3]])
      }
      return results.join(', ') // returns a joined string of linked objects' fields (e.g. the names of linked tags)
      // return fieldContent[0].fields[queries[3]] // returns the FIRST linked field
    }

    // otherwise just return whatever is in that field, e.g. an array of image objects, etc.
    return fieldContent
  }


  // a simpler version of find, which was restrictive:
  // - had to take a table object like { Content: [table] }
  // - threw errors whenever something was broken
  // - returned an array of results, in case of duplicates
  //
  // this one is simpler:
  // - takes a string, just like in Find (above)
  // - takes an array of airtable objects (e.g. [table], or one of the tables that Find required)
  // - returns undefined if there's an error (doesn't throw an error)
  // - always returns one item (the first assumes lookup values are unique)
  // - is just a wrapper for Find
  // takes: 
  static findOne(findStr, table, fields = ['Name']) {

    if (!table)
      return undefined

    if (typeof (fields) == "string") {
      console.error('[Cytosis] find "fields" argument must be an array')
      return undefined
    }

    // the key has to match the source of the findStr
    // if it's in the form 'Content.something' then 'Content' is the key
    // otherwise if it doesn't have the structure, key doesn't matter
    const key = findStr.split('.').length > 0 ? findStr.split('.')[0] : '_key'
    // console.log('findOne input', findStr, key, table, fields)
    let payload = {}
    payload[key] = table
    const output = this.find(findStr, payload, fields)
    // console.log('findOne output', output)

    if (output && output.length && output.length > 0) // return the first el of an array, if using 'Content.something'
      return output[0]
    else if (output)
      return output // if findStr doesn't have . separators, it'll return an object

    return undefined
  }

  // findField
  // combines findOne with a way to get the field, with proper fallback
  // a common use cases is: this.$cytosis.findOne('home-featured', this.$store.state['Content'] ).fields['Content'],
  // but this crashes if the content can't be found, which is a fairly easy occurence
  // 
  // instead, this fn allows us to do:
  // this.$cytosis.findField('home-featured', this.$store.state['Content'], 'Content', ['Name'] )
  // 
  // - this gets the content from Markdown
  // - or returns undefined if it doesn't exist (rather than crashing)
  // 
  // input: findStr — the column item you're looking for
  // table: the airtable of contents
  // contentField: the content field you're looking for (e.g. 'Content')
  // fields: the columns you're trying to find a match 
  static findField(findStr, table, contentField, fields = ['Name']) {
    let element = Cytosis.findOne(findStr, table, fields)
    if (element && element.fields && element.fields[contentField])
      return element.fields[contentField]
    else if (element && element[contentField]) // for flat items
      return element[contentField]
    return undefined
  }












  // simple promise-based wrapper for saving to airtable
  // no recordId: creates a new record
  // recordId: replaces current record
  // note that the API requires tablename regardless either we find it or pass it in
  // Input: 
  //    payload: a JS object with one or more keys that match field (column) names in the table
  //    tableName: a string indicating what table to save to
  //    cytosis: cytosis object (w/ proper key/base)
  //    recordId: a string, if defined, would save the object into the existing record w/ recordId
  // 
  // If tableOptions.linkedObjects exists, save() will make sure those exist in linked tables, and fill in the details w/ a create()  
  // 
  // Tip: For a field that's linked to a table that only cares about the key field (e.g. Name, like a list of keywords), all you need to 
  // do is turn on Typecast and pass in a list of CSVs. Typecast will create new records and link them automatically. 
  /*
    Linked objects usage: This creates a single linked record, with name Alpha and extra content
    in linkedObjects:
      key = the key in the linked table, e.g. Keywords to find the keyword
      field = the name of the linked field in the original payload
      table = the table where the list of keywords reside

    payload: {
      ...,
      'Keywords': {Name: "Alpha", fieldName: "Content"},
    }
    // tableOptions:
    {
      insertOptions: ['typecast'],
      linkedObjects: [{ key: 'Name', field: 'Keywords', table: 'Keywords' }],
    },

    // to add multiple new objects, use an array of objects
    'Keywords': [
      {Name: "-- Alpha", Test: "Alpha content"},
      {Name: "-- Beta", Test: "Beta content"},
      {Name: "-- Charlie", Test: "Charlie content"},
    ],

  */
  // 
  // Output:
  //    an object: the saved record object as returned from Airtable
  static save({ payload, tableName, apiKey, baseId, cytosis, recordId, tableOptions }) {

    const base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId) // airtable base object
    const typecast = tableOptions && tableOptions.insertOptions && tableOptions.insertOptions.includes('typecast') ? true : false
    let linkedObjects = {}

    // create a linked object
    // first let typecast create the new object
    // then fill in the rest of the data in the newly created
    // (or already existing) linked object
    if (tableOptions && tableOptions.linkedObjects) {
      tableOptions.linkedObjects.map((obj) => {
        if (Array.isArray(payload[obj.field])) {
          // if we pass in an array of complex objects, we need to pick out the key
          // and let Airtable create new records of them before we can link them
          // and fill out the objects properly
          linkedObjects[obj.field] = { ...obj, ...{ payload: payload[obj.field] } }

          payload[obj.field] = payload[obj.field].map(o => (o[obj.key])).join(', ')
        } else {
          linkedObjects[obj.field] = { ...obj, ...{ payload: payload[obj.field] } }
          // create an item that allows for typecast to create the object
          // which only works by passing it a string of the key field, e.g. Name 
          payload[obj.field] = payload[obj.field][obj.key]
        }
      })

      // console.log('linked objects:', linkedObjects, Object.keys(linkedObjects), ' final payload:', payload)
    }

    // after typecast's created the new linked object
    // look for it under Fields, grab the array of IDs, and update!
    // this can get API-intensive as it requires a lookup first
    const insertLinkedObjects = function (record) {
      return new Promise((resolve, reject) => {
        // console.log('inserting linked objects', record, linkedObjects)

        let pRecords = [] // promises of records pulled from the linked tables
        let pUpdated = [] // promises of records after they're all saved

        // for each linked object, find it in the record
        Object.keys(linkedObjects).map((linkedObjectKey) => {
          let linkedFieldIds = record.fields[linkedObjectKey] || []
          // console.log('linked field IDs:', linkedFieldIds, linkedObjectKey, linkedObjects[linkedObjectKey])

          // for each linked ID, get the record using find, so we can match against the key (e.g. Name)
          linkedFieldIds.map(async (linkedId) => {
            pRecords.push(new Promise((_resolve, _reject) => {
              // console.log('grabbing linked Id:', linkedId)
              base(linkedObjects[linkedObjectKey].table).find(linkedId, function (err, _record) {
                if (err) { console.error(err); Promise.reject(err); return; }
                // console.log('pushing linked record:', _record)
                _resolve(_record)
              })
            }))
          })
        })

        // for each pulled record, now update it w/ the object
        Promise.all(pRecords).then((records) => {
          // console.log('All pulled records.....', pRecords, records)
          records.map((record) => {
            // find a match to an object
            Object.keys(linkedObjects).map((lkObjKey) => {
              // console.log('iterating records:', record, ' ---|--- ', lkObjKey, linkedObjects[lkObjKey], linkedObjects[lkObjKey].payload[linkedObjects[lkObjKey].key])

              if (Array.isArray(linkedObjects[lkObjKey].payload)) {
                linkedObjects[lkObjKey].payload.forEach(objToBeAdded => {
                  if (objToBeAdded[linkedObjects[lkObjKey].key] == record.fields[linkedObjects[lkObjKey].key]) {
                    pUpdated.push(new Promise((_resolve, _reject) => {
                      let _newRec = {
                        ... { id: record.id },
                        ... { fields: objToBeAdded }
                      }
                      // console.log('found record match ', linkedObjects[lkObjKey], record, ' new record:', _newRec, ' table:', linkedObjects[lkObjKey].table)
                      base(linkedObjects[lkObjKey].table).update([_newRec], { typecast: true }, function (err, _record) {
                        if (err) { console.error(err); Promise.reject(err); return; }
                        // console.log('new record updated...', _record)
                        _resolve(_record)
                      })
                    }))
                  }
                })
              } else {
                if (linkedObjects[lkObjKey].payload[linkedObjects[lkObjKey].key] == record.fields[linkedObjects[lkObjKey].key]) {
                  pUpdated.push(new Promise((_resolve, _reject) => {
                    let _newRec = {
                      ... { id: record.id },
                      ... { fields: linkedObjects[lkObjKey].payload }
                    }
                    // console.log('found record match ', linkedObjects[lkObjKey], record, ' new record:', _newRec, ' table:', linkedObjects[lkObjKey].table)
                    base(linkedObjects[lkObjKey].table).update([_newRec], { typecast: true }, function (err, _record) {
                      if (err) { console.error(err); Promise.reject(err); return; }
                      // console.log('new record updated...', _record)
                      _resolve(_record)
                    })
                  }))
                }
              }
            })
            // base(tableName).create
          })
          resolve(true)

          Promise.all(pUpdated).then((updated) => {
            console.log('All successfully added!')
            resolve(updated)
          })
        })

        // resolve(true)
      })

    }

    try {
      return new Promise(function (resolve, reject) {
        if (!recordId) {
          base(tableName).create(payload, { typecast }, async function (err, record) {
            if (err) { console.error('Airtable async save/create error', err); reject(err); return }
            console.log('New record: ', record.getId(), record.fields['Name'])

            if (Object.keys(linkedObjects).length > 0)
              await insertLinkedObjects(record)

            resolve(record)
          })
        } else {
          // old API doesn't support typecast
          base(tableName).update(recordId, payload, { typecast }, async function (err, record) {
            if (err) { console.error('Airtable async save error', err); reject(err); return }
            console.log('Updated record: ', record.getId(), record.fields['Name'])

            if (Object.keys(linkedObjects).length > 0)
              await insertLinkedObjects(record)

            resolve(record)
          })
        }
      })

    } catch (e) {
      console.error('Save Object to Airtable error (do you have Creator permission?)', e); return
    }
  }





  // uses the Airtable create/update/replace API by passing in an array as a payload 
  // in order to update or replace, each object must have an "id" field w/ a correct record ID
  // passes in an array of objects (id is embedded within the objects)
  // takes up to ten objects in the array (or Airtable will make it fail) TODO: accept more than 10 and break it up with a loop
  // set "create" to true to create has to be explicit, since it's easier to read 
  // to create: objectArray = [{fields: "name: {}, ..."}]
  // to update: objectArray = [{id: "123", fields: "name: {}, ..."}]
  // type: create | update | replace

  static saveArray({ payload, tableName, apiKey, baseId, cytosis, tableOptions, type = "create" }) {

    const base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId) // airtable base object
    const typecast = tableOptions && tableOptions.insertOptions && tableOptions.insertOptions.includes('typecast') ? true : false

    if (!Array.isArray(payload) || (Array.isArray(payload) && payload.length < 1)) {
      console.error('saveArray payload needs to be an array of objects')
    }

    let finalPayload = []
    // The Airtable object takes objects of shape { fields: {/* whatever fields here*/} } which is annoying, 
    // so we make sure the payload is properly formatted
    if (typeof payload[0].fields === 'undefined') {
      payload.map((item) => {
        finalPayload.push({
          id: item.id, // id is required for saving/updating
          fields: item,
        })
      })
    } else {
      payload.map((item) => {
        finalPayload.push({
          id: item.id, // id is required for saving/updating
          fields: item.fields,
        })
      })
    }

    // console.log('saving array:', finalPayload)
    try {
      return new Promise(function (resolve, reject) {
        if (type == 'create') {
          base(tableName).create(finalPayload, { typecast: typecast }, function (err, records) {
            if (err) { console.error('Airtable async saveArray/create error', err); reject(err); return }
            console.log('New records: ', records)
            resolve(records)
          })
        } else if (type == 'update') {
          base(tableName).update(finalPayload, { typecast: typecast }, function (err, records) {
            if (err) { console.error('Airtable async saveArray/update error', err); reject(err); return }
            console.log('Updated records: ', records)
            resolve(records)
          })
        } else if (type == 'replace') { // destructive updates (undefined fields will be cleared)
          base(tableName).replace(finalPayload, { typecast: typecast }, function (err, records) {
            if (err) { console.error('Airtable async saveArray/update error', err); reject(err); return }
            console.log('Updated records: ', records)
            resolve(records)
          })
        }
      })

    } catch (e) {
      console.error('SaveArray Object to Airtable error (do you have permission?)', e); return
    }
  }



  // Deletes an existing record from a table
  // The given API key needs account permission to delete
  // Input:
  //    tableName: a string, the name of the table
  //    cytosis: cytosis object (w/ proper key/base)
  //    recordId: a string, the Id of the record to be deleted
  // Output:
  //    an object: the deleted record object as returned from Airtable
  static delete({ tableName, apiKey, baseId, cytosis, recordId }) {

    const base = Cytosis.getBase(apiKey || cytosis.apiKey, baseId || cytosis.baseId) // airtable base object

    if (!recordId)
      throw new Error('[Delete] Please provide a Record ID!')

    try {
      return new Promise(function (resolve, reject) {
        if (recordId) {
          base(tableName).destroy(recordId, function (err, record) {
            if (err) { console.error('Airtable async delete error', err); reject(err); return }
            console.log('Deleted record: ', record.getId(), record.fields['Name'])
            resolve(record)
          })
        }
      })

    } catch (e) {
      console.error('Delete Object from Airtable error (do you have permission?)', e); return
    }
  }



  // this has been superceded by save() and insertLinkedObjects
  // the biggest difference is the API access requires Creator for 
  // typecast, but it takes some of the work off
  // 
  // Saves a list of strings to a target table
  // If a string is not matched, it's created as a unique record in the target table
  // If a string is found as a match in the target table (usually the key field 'Name'), a new record doesn't get created
  // Returns an array of ids of all matched or new records
  // 
  // Really useful for tables like Tags that basically just have 'Name'. This dedupes the rows, and makes sure saved items are 
  // tagged properly
  // - Make sure to use this on fields like "Tags" that have linked data
  // - This will return an array of ids that Airtable will save as Links to the other table
  // - *** Make sure to update your local tables getTables
  // 
  // NOTE: if typecast is true, Airtable will create a new object with the linked table with the new name, but will not let you add
  //       data in the other fields
  // 
  // resolves linked tables like tags and collections (b/c Airtable doesn’t return table details this has to be semi-manual)
  // takes a list of string or data objects, adds them to the base, and return a list of ids where they were just added
  // for each object in a list (e.g. a list of tag names):
  // 1. resolve against the existing objects (e.g. Tag records), if it exist, use the existing id
  // 2. if it’s a new object, add it to the table and get the id
  // 3. return the new array of ids
  // "Tags": fave.tags ? await resolveLinkedTable(base, fave.tags, 'Tags', _this.$store.state.data.tags) : [],
  // "Collections": fave.collections ? await resolveLinkedTable(base, fave.collections, 'Collections', _this.$store.state.data.collections) : [],
  // static async resolveLinkedTable(list, tableName, sourceTable, colName='Name') {
  // note, uses this.save, so can't be static!
  // Input:
  //    stringList: an array of strings that represent the records (e.g. Tag Names) in the target
  //    targetTableName: the name of the target table (e.g. "Tags")
  //    sourceTable: an array of Airtable record objects where the matches could be found
  //    cytosis: cytosis object (w/ proper key/base)
  //    colName: usually matches the 'Name' (default) field but could be anything
  // Output:
  //    an array of record Ids that match the list
  static async saveLinkedTable(stringList, targetTableName, sourceTable, cytosis, colName = 'Name') {
    let recordIds = await stringList.reduce(async (resultPromise, listItem) => {
      const _result = await resultPromise

      // find a match and return the id
      for (let record of sourceTable) {
        const recordName = record.fields[colName]
        if (recordName && listItem.toLowerCase() == recordName.toLowerCase()) {
          return _result.concat(record.getId())
        }
      }
      // if no match, we have to create a new one and get its id
      let recordId = await Cytosis.save({ 'Name': listItem }, targetTableName, cytosis)

      // bug? this touches the sourceTable
      // is it possible to set sourceTable = stringList (thus updating the source to include the list) from here?
      // sourceTable might be passed by reference making it possible, or that might need to be done on the calling fn
      // otherwise you get duplicate tags / linked table rows

      return _result.concat(recordId.id)
    }, Promise.resolve([]))

    // console.log('result: ' , result)
    return recordIds
  }














  // takes a table and strips it of everything but the fields and ids
  // really useful for storing data w/o all the other airtable stuff
  // -- note, this does NOT iterate through all the returned tables
  // Input: 
  //    a table array (e.g. Content: [...])
  // Output: 
  //    a table array where each object only has id and fields, no helpers
  static cleanTable(table, flat = false) {
    // clean up the cytosis table by only keeping id, fields, and basics of _table
    return table.map(entry => {
      // console.log('cleanData . entry', entry)
      if (flat) return { ...entry.fields, record_id: entry.id }
      return {
        fields: entry.fields,
        id: entry.id
      }
    })
  }


  // takes an airtable record and keeps field and id
  // and removes all the other stuff
  static cleanRecord(record, flat = false) {
    if (flat) {
      // flatten result so we don't have 'fields' object anymore
      return { ...record.fields, record_id: record.id }
    }

    return {
      fields: record.fields,
      id: record.id,
      // _rawJson: record._rawJson,
      // _table: {
      //   name: record._table.name,
      //   _base: {
      //     _id: record._table._base._id,
      //     // the record also exposes the airtable API key, but
      //     // it really shouldn't be exposed here
      //   }
      // }
    }
  }


  // takes a cytosis object and 
  // iterates through tables and cleans them all up.
  // really useful for caching and storing data
  // Input: 
  //    a cytosis object
  // Output: 
  //    a stripped down cytosis object
  static strip(cytosis) {

    let _cytosis = {}
    _cytosis['config'] = { _cytosis: Cytosis.cleanTable(cytosis.config._cytosis) }
    _cytosis['airBase'] = cytosis['airBase']
    _cytosis['apiKey'] = cytosis['apiKey']
    _cytosis['endpointUrl'] = cytosis['endpointUrl']
    _cytosis['routeDetails'] = cytosis['routeDetails']
    _cytosis['results'] = {}

    Object.keys(cytosis['results']).map((tableName) => {
      _cytosis['results'][tableName] = Cytosis.cleanTable(cytosis.tables[tableName])
    })

    return _cytosis
  }

  // from an airtable facebook group discussion / Nick Cappello
  // he's apparently created his own API, so this isn't super useful, but it shows how introspection works!
  // https://gist.github.com/hightide2020/d6a73b35958da1b26078344a26588fb8?fbclid=IwAR0qak04ksgMn3ta_G04xnZ3APVshw2Odg3m4GnZBOj3Hz6GqTcc57ump50
  /* get _blankFields
   * Returns a key-value Object of empty Fields.

      Introspection usage:

      const test = this.$cytosis.findOne('home-mission', this.$store.state['Content'] )

      let _this = this
      Object.defineProperty(test, 'blankFields', {
        get: _this.$cytosis.blankFields
      })

  */
  // static blankFields () {
  //   if (typeof this.fields !== 'object' || this.fields === null)
  //     return {}

  //   const entries = Object.entries(this.fields)
  //   const blankFields = {}

  //   for (const [key, settings] of entries) {
  //     console.log('entries:', entries, key, settings)
  //     if (settings === undefined) {
  //       const error = new Error(
  //         `Improper Field Definition in Table '${this.name}'.\n` +
  //         `Received: ${settings}`
  //       )
  //       error.name = 'TableError'
  //       throw error
  //     }
  //     if (typeof settings.name !== 'string') {
  //       const error = new Error(
  //         `Improper Field Definition in Table '${this.name}'.\n` +
  //         `Expected 'name' to be a string.\n` +
  //         `Received: ${settings}`
  //       )

  //       error.name = 'TableError'
  //       throw error
  //     }
  //     const args = [settings.name, undefined, { ...settings }]
  //     const blankField = typeof settings.type !== 'function' ? new UnknownField(...args) : new settings.type(...args)
  //     blankFields[key] = blankField
  //   }

  //   return blankFields
  // }









  // Given a list of recordIds, gets the record objects
  // 
  // getRecord works a little better, but requires multiple API calls this one uses local data
  // converts a list of record ids into a name (e.g. converts an Id from Tags to the name or the entire object)
  // these are stored inside the data category
  // old version would take a tableName, new one just takes a table
  // this works like "Lookup" of airtable
  // Input: 
  //    recordIds: ['recordId','recordId']
  //    sourceArray: array of records where the recordIds could be found, or a Cytosis.results object
  //    getObj: if true, will return entire object, otherwise just gets the name of the row
  //    CHANGED: if fieldName is provided, gets a field name, otherwise gets the object
  // Output:
  //    either an array of names or array of Airtable records
  static getByIds(recordIdArray, source, fieldName) {
    if (!recordIdArray || !source)
      return []

    // we expect source to be an array of records
    // but if it's a Cytosis.results object, we'll put all the records into one big array
    if (!Array.isArray(source) && Object.keys(source) && Object.keys(source).length > 0) {
      let newSource = []
      Object.keys(source).map((tableName) => {
        newSource = [...newSource, ...source[tableName]]
      })
      source = newSource
    }

    let records = []
    for (let recordId of recordIdArray) {
      for (let linkedRecord of source) {
        if (recordId == linkedRecord.id) {
          // if(getObj) {
          //   records.push(linkedRecord)
          // } else {
          if (fieldName)
            records.push(linkedRecord.fields[fieldName])
          else
            records.push(linkedRecord)
          // }
        }
      }
    }
    return records
  }

  // gets the contents of a field/column (e.g. an Attachments or 'Links to Tags' column)
  // If linked, also converts them from a array of IDs to usable objects
  // Otherwise returns the array of contents that map to the original array
  //  - useful for getting image attachments and multiple select list values
  // FUTURE: eventually should work on duplicate names, but that gets super confusing to 
  // handle returned values findReplacing works really well if names are treated unique
  // Input:
  //    recordArray: array of Airtable record objects that we want more information on
  //    fieldName: name of the field/column to retrieve
  //    linkedTable: array of Airtable records that we pull linked content from (e.g. Tag info)
  //      - if linkedTable is left undefined, we'll just get an array of recordIds for each record
  // Output:
  //    An array of records: if we retrieve linked table records
  //    An array of results. results.len = recordArray.len
  //    each result could be an array, so the result is very likely a 2D array
  static getFieldContent(recordArray, fieldName, linkedTable = undefined) {
    let results = []
    // console.log(`Getting the ${fieldName} contents of`, recordArray)
    for (let record of recordArray) {

      if (linkedTable) {
        const recordIds = record.fields[fieldName]
        let linked = Cytosis.getByIds(recordIds, linkedTable)
        // console.log('linked:', recordIds, linkedTable, linked)
        if (linked.length > 0) {
          // results = results.concat(linked)
          results.push(linked)
        }
        else
          // results.concat(record.fields[fieldName])
          results.push(record.fields[fieldName])
      }
      else
        results.push(record.fields[fieldName])
    }

    return results
  }

  // (this version returns a one dimensional array, compared to getFieldContent)
  // gets the content in the form array of values from an array of records, given a field name
  // useful for getting all the Names from a record array, in a new array
  // similar to getNames and getFieldValues but w/ arbitrary fieldname and null filtering & deduplication
  // fieldName is a string
  static getFields(recordArray, fieldName = 'Name') {
    let results = []
    for (let record of recordArray) {
      if (record.fields && record.fields[fieldName]) {
        // results.push(record.fields[fieldName]) 
        results = [...results, ...record.fields[fieldName]] // this spreads the results out
        // MIGHT lead to unintended results, for example w/ attachments
      }
    }
    // deduplicate fields
    return this.deduplicate(results)
    // return results
  }

  // is this the same as getFields? maybe leave this one alone,
  // gets a unique list of values for the entire given field (column)
  // this only shows what options have been selected, not possible single and multiple select values
  // e.g. used for Single and Multiple Select lists, this gets every option
  // Input:
  //    recordArray: an array of Airtable records
  //    field: the name of the field to get (string, ex: 'Tags')
  // Output:
  //    an array of values (NOT an array of Airtable objects)
  static getFieldValues(recordArray, field) {
    let results = []
    // console.log(`Getting the ${field} contents of`, recordArray)
    for (let record of recordArray) {
      const recordValue = record.fields[field]

      // if the value's an array, it's a multiple list, so we break it up
      if (Array.isArray(recordValue)) {
        for (let rV of recordValue) {
          if (!results.find(r => r == rV)) {
            results.push(rV)
          }
        }
      } else {
        if (!results.find(r => r == recordValue)) {
          results.push(recordValue)
        }
      }
    }
    return results
  }


  // superceded by getFields
  // turns an array of Airtable records into an array of record names
  // useful for creating filter lists, etc.
  // Input:
  //    recordArray: an array of Airtable records
  // Output:
  //    an array of names (string values NOT an array of Airtable objects)
  // static getNames(recordArray, fieldName='Name') {
  //   let results = []
  //   for (let record of recordArray) {
  //     if(record)
  //       results.push(record.fields[fieldName])
  //   }
  //   return results
  // }




  // only let Airtable object arrays through that contain the string, in the given fields
  // multiple fields e.g. fieldsArray = ['Name','Hosts'], will search both
  // requires cytosis to search through linked fields
  // Input:
  //    str: search string
  //    source: array of records you're looking through, or the Cytosis.results object: results: { tableOne: [record, record], tableTwo: ...}
  //    opts:
  //      fields: (optional) array of field/column names e.g. ['Name','Tags'] — all fields will be searched if this is empty
  //      exactMatch: bool
  //      matchCase: bool
  //      linkedTables: array of Airtable arrays sources for any linked columns, e.g. for tags
  //      linkedTableKey: string of the key of the linked table (default is 'Name')
  // Output:
  //    array of filter-searched Airtable objects

  // add exact match? (give an exactmatch condition, and remove lowercase and instead of includes use '==')
  static search(str, source, opts = {}) {

    let { fields = [], exactMatch = false, matchCase = false, linkedTables = [], linkedTableKey = 'Name' } = opts

    let searchterm = matchCase ? str : str.toLowerCase() // if not matching case, make everything lowercase

    if (!str)
      return source // pass through if no search string simplifies chaining

    // we expect source to be an array of records
    // but if it's a Cytosis.results object, we'll put all the records into one big array
    if (!Array.isArray(source) && Object.keys(source) && Object.keys(source).length > 0) {
      let newSource = []
      Object.keys(source).map((tableName) => {
        newSource = [...newSource, ...source[tableName]]
      })
      source = newSource
    }

    // if there's no fields, we construct it by going through each record
    // and identify the fields
    if (fields.length == 0) {
      source.map((record) => {
        fields = [...fields, ...Object.keys(record.fields)]
      })
    }
    fields = Cytosis.deduplicate(fields)

    return source.filter(function (obj) {
      for (let field of fields) {
        // console.log('search', str, obj.get(field) )
        if (obj.fields[field]) {
          if (typeof (obj.fields[field]) == 'string') {
            let sourceStr = matchCase ? obj.fields[field] : obj.fields[field].toLowerCase()
            if (exactMatch) {
              if (sourceStr == searchterm) return true
            }
            else {
              if (sourceStr.includes(searchterm)) return true
            }
          }
          else if (Array.isArray(obj.fields[field])) {
            // if it's an array of strings (e.g. multiple list)
            // linked records are also a list of strings, so we have to check for a string match
            // every time we see an array
            for (let strField of obj.fields[field]) {
              // if (strField.toLowerCase().includes(searchterm)) return true
              let sourceStr = matchCase ? strField : strField.toLowerCase()
              if (exactMatch) {
                if (sourceStr == searchterm) return true
              }
              else {
                if (sourceStr.includes(searchterm)) return true
              }
            }

            if (linkedTables && linkedTables.length > 0) {

              if (Array.isArray(linkedTables) && linkedTables[0].fields) {
                // throw new Error('[Cytosis/search] Make sure "linkedTables" is an array of tables — make sure to wrap your table in an array!')
                // if just given a table of records, wrap it in an array
                linkedTables = [linkedTables]
              }


              for (let linkedTable of linkedTables) {
                const records = Cytosis.getByIds(obj.fields[field], linkedTable)
                for (let record of records) {
                  // for linked records, only match against the name
                  // if (record.fields[linkedTableKey].toLowerCase().includes(searchterm)) return true
                  if (record) {
                    let sourceStr = matchCase ? record.fields[linkedTableKey] : record.fields[linkedTableKey].toLowerCase()
                    if (exactMatch) {
                      if (sourceStr == searchterm) return true
                    }
                    else {
                      if (sourceStr.includes(searchterm)) return true
                    }
                  }
                }
              }
            }

          }
        }
      }
      return false // no match

      // return obj.fields.Name && obj.fields.Name.toLowerCase().includes(searchterm) ||
      //       obj.fields.Notes && obj.fields.Notes.toLowerCase().includes(searchterm) ||
      //       obj.fields.Description && obj.fields.Description.toLowerCase().includes(searchterm) ||
      //       obj.fields.URL && obj.fields.URL.toLowerCase().includes(searchterm) ||
      //       obj.fields.Domain && obj.fields.Domain.toLowerCase().includes(searchterm) ||
      //       obj.fields.Authors && obj.fields.Authors.toLowerCase().includes(searchterm)
    })
  }






































  // Splits an object into many parts to be stored to Airtable
  // stores them as JSON useful for using Airtable as a "data warehouse"
  // 
  // Takes an Airtable record object { ... data ..., 'hugeField': {tons of data} }
  // and breaks it into multiple chunks (Airtable has a size limit of 100,000 chars for Long Text fields)
  // *** Requires the key-1, key-2, ... fields to exist in Airtable as Long Text columns
  // *** Requires enough chunks, as the API can't create new fields
  // *** Each chunk is 1-indexed!!!!
  // 
  // Input:
  //    record: Airtable record object (unstringified!)
  //    key: field/column name 
  // Output:
  //    Changes the original record so that 
  //    record = {
  //      hugeField: {chunks: i, chunkSize: #} // JSON.stringified and saved into the key field
  //      hugeField-1: chunk 1  // these are saved right into the record, so when an Airtable save will save these straight into a field
  //      hugeField-2: chunk 2
  //      ...
  //    }
  static split(record, key, maxChunks = 4, chunkSize = 100000) {
    // TODO: convert confusing while loops into [...Array(5).keys()] and iterate for ... of like Python range()
    let itemString = JSON.stringify(record.fields[key])

    // if the key (e.g. _data) doesn't exist, just return the object
    if (itemString === undefined)
      return record

    // too big? split the output into an array and into columns _data-1, -2, -3 etc
    // originally if a item was small it wouldn't get split, but that introduced data irregularities
    // if( itemString.length >= chunkSize) {
    let parts = []
    let i = 0
    let length = itemString.length

    while (length > 0) {
      parts.push(itemString.substr(i * chunkSize, chunkSize))
      length -= chunkSize
      i++
    }
    // save the metadata into the original key
    // _data stores the metadata
    record.fields[key] = JSON.stringify({
      chunks: i,
      chunkSize: chunkSize,
    })

    let j = 0
    if (i < maxChunks) { // hard limit 
      while (j < i) {
        record.fields[`${key}-${j + 1}`] = parts[j]
        j++
      }
    } else {
      throw new Error(`[Cytosis] — couldn’t split record "${record.fields.Name}" — not enough chunks`)
    }
    // }
    return record
  }




  // Takes a split record and merges it together, removing the metadata in the process
  // Takes all the hugeField-1
  // The result will look like the original, too-long record
  // Input:
  //    record: The Airtable record w/ the split data
  //    key: The name of the field to unsplit (String)
  // Output:
  //    record: The Airtable record w/ the original key/data
  static unsplit(record, key) {
    // a split record will always have chunks and chunkSize
    // return the record if it doesn't have a split

    if (!record.fields[key] || !JSON.parse(record.fields[key]).chunks)
      return JSON.parse(record.fields[key])

    const chunks = JSON.parse(record.fields[key]).chunks
    let itemString = ''
    let i = 0

    while (i < chunks) {
      itemString += record.fields[`${key}-${i + 1}`]
      delete record.fields[`${key}-${i + 1}`] // remove the chunked partials for memory
      i++
    }

    const data = JSON.parse(itemString)
    // originally just returned the unsplit data
    // return JSON.parse(itemString)
    // now replaces metadata w/ regular data so the object doesn't "appear" mutated to user
    // the record deletes the chunked partials
    record.fields[key] = data
    return record
  }


































  // deduplicate an array of anything (useful for generating list outputs)
  // Input: array of Airtable records
  // Output: array of unique Airtable records
  static deduplicate(array) {
    return array.filter((val, i, arr) => (arr.indexOf(val) == i))
  }

  // Sorts an array of Airtable objects by a given column, A>Z
  // This is sort of just an example on how to sort, as it doesn't really do a whole lot
  // Input:
  //    recordArray: an array or Airtable records
  //    sortBy: field/column to sort values by
  //    sortFn: a sort function
  static sort(recordArray, sortBy = 'Name', sortFn = undefined) {
    recordArray.sort(sortFn || function (a, b) {
      var nameA = a.fields[sortBy].toUpperCase() // ignore upper and lowercase
      var nameB = b.fields[sortBy].toUpperCase() // ignore upper and lowercase
      if (nameA < nameB) { return -1 }
      if (nameA > nameB) { return 1 }
      return 0
    })
    return recordArray
  }


  // 
  //  Filter Generators
  // 
  //  Airtable has a weird syntax for filters. It's pretty annoying.
  //  These help make them less annoying
  // 


  static filter_or(keywords, field) {
    // field is a column name. Ex: "Slug" 
    // keywords is an array of keywords. Ex: "['jan-zheng', 'jessica-sacher']"
    // this generates: 'IF(OR({Slug}="jan-zheng", {Slug}="jessica-sacher"), TRUE())'

    let orArr = [], strArr = ""
    keywords.map((keyword) => {
      // generates: {Slug}="jan-zheng", {Slug}="jessica-sacher"
      orArr.push(`{${field}}="${keyword}"`)
    })
    strArr = orArr.join(', ')
    return `IF(OR(${orArr}), TRUE())`
  }







  // CURRENTLY NOT FUNCTIONAL, and not really a use for it right now
  // joins/combines multiple tables into one new object
  // would be good to have a join (inner), join-left, join-right, outer-join (full) from SQL
  // useful for making combinations for infographics or tables for tallying, etc.
  // takes an array of objects in the form of
  // [{data: (tags object), fields: ['Name', 'Notes']}, {data: (people object), fields: ['Name', 'Tags']}]
  // - fields is optional leaving it out joins all fields
  // also takes a function that determines the name of each row if none given, the new object combines the first fields of each object
  // identical field names will be concatenated
  // static join (tables, nameFn=undefined) {
  //   let result = {}

  //   if(!tables || !Array.isArray(tables) || !tables.length < 1)
  //     return undefined

  //   tables.map((table) => {
  //     const data = table.data
  //     const fields = table.fields && Array.isArray(table.fields) ? table.fields : undefined

  //     for (let field of fields) {
  //       result[field] = { ...result[field], data[field]} // concatenate if field already exists
  //     }

  //     // define the name transform method
  //     nameFn = nameFn ? nameFn : function(result) {
  //       console.log('namefn result', result)
  //       return result
  //     }

  //     return nameFn(result)
  //   })

  // }

}

export default Cytosis



