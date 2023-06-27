/* last updated: 10/8/2020

  Simple wrapper around caching
  - file-based or fauna-based caching later
  - wrapper makes swapping easier

  - consider using node-persist
  - merging a compile-time loader into node-persist on init might be cool

*/

import NodeCache from 'node-cache'

// using a util like this lets every part of an app or server use the same cache
// export const nodecache = new NodeCache()

// useClones: false = much better performance;
// also stores references which means updating refs will update data, which makes
// updating the cache data much easier
// this is REQUIRED for serverless systems where users can CRUD
// the caches need to be updated manually
export const nodecache = new NodeCache({ useClones: false })
// let cacheList = [] // deprecate cacheList / can't remember why this was implementet


export const cacheGet = (key, loud = false) => {
  if (loud)
    console.log('cacheGet', key, typeof nodecache.get(key))
  return nodecache.get(key)
}

export const cacheSet = (key, data, ttl = 60 * 60, loud = false) => {
  if (loud)
    console.log('cacheSet', key, ttl)
  // cacheList.push({key, ttl})
  return nodecache.set(key, data, ttl)
}

export const cacheMget = (arr, loud = true) => {
  // gets cache vals based on an array of keys ['key1', 'key2', ...]
  if (loud)
    console.log('cacheMget', arr)
  return nodecache.mget(arr)
}

export const cacheMset = (arr, ttl = 60 * 60, loud = true) => {
  // takes an array: [{key: 'some-key', val: obj, ttl}]
  // ttl is a default added to each item in the array
  if (loud)
    console.log('cacheMset', arr, ttl)

  arr.map((item, i) => {
    if (!item.ttl) // only assign ttl if unspecified
      arr[i]['ttl'] = ttl // assign default ttl for each key for consistency
  })

  // cacheList = [...cacheList, arr] // attach to cachelist
  return nodecache.mset(arr)
}


export const cacheXget = (term, loud = true, justKeys = false) => {
  // useful for getting an entire "family" of caches, 
  // since cache doesn't support nested objects
  // gets all values that include a partial of the key
  // e.g. term="user-" then this returns all keys that have with "user-"
  // cacheXget('one.',false,true) just gets the keys
  // cacheXget('one.') gets all keys that contain the term
  if (loud)
    console.log('cacheXget', term)

  let keys = nodecache.keys()
  let newKeys = keys.filter(k => k.includes(term)) || []

  if (justKeys) // sometimes could be a LOT of data. This is useful for counting keys
    return newKeys

  return nodecache.mget(newKeys)
}





export const getCacheKeys = () => {
  return nodecache.keys()
  // return {
  // 	keys: nodecache.keys(),
  // 	// cacheList: cacheList
  // }
}

// get all cache data
export const getCacheData = () => {
  return nodecache.mget(nodecache.keys())
}


export const cacheClear = (key) => {
  if (key) {
    nodecache.del(key)
    // const itemIndex = cacheList.findIndex(c => c.str === key)
    // cacheList.splice(itemIndex,1)
    console.warn('[cacheClear] Cache key wiped:', key)
    return true
  }

  let keys = nodecache.keys()
  let numItems = nodecache.del(keys) // returns number of deleted items
  console.warn('[cacheClear] Entire cache wiped: ', numItems)

  // cacheList.map(cache => {
  // 	nodecache.del(cache.key)
  // })
  // cacheList = []
  return true
}


// clear keys that contain a part the given term, e.g. '_users-'
export const cacheXclear = (term) => {
  let keys = nodecache.keys()
  let newKeys = keys.filter(k => k.includes(term)) || []
  let numItems = nodecache.del(newKeys) // returns number of deleted items
  console.warn('[cacheXclear] Keys cleared:', numItems)
  return numItems
}





// helper for checking if a string exists in cache
export const cacheCheck = (_cacheStr, loud = false) => {
  // TODO: use node to turn on/off cache?
  // if (cacheGet(_cacheStr) && process.env.CACHE && !process.env.CACHE == 'NoCache')
  if (cacheGet(_cacheStr, loud)) {
    return cacheGet(_cacheStr, false)
  }
  return null
}