
/* 

  Svelte Store for general site content for front-end

  - store Airtable, Grabby, Notion, user profiles, and other copy used for the site

*/

import * as store from 'svelte/store'
// import { get } from 'svelte/store';
// import * as localStorage from "svelte-local-storage-store";


// The following content should be populated by _layout on page load
// or whichever page(s) are using the Endpoint, to speed up subsequent loads



// SiteData should mirror a cytosis.results setup
// results['Content','Profiles']
export const Store = store.writable({})

// gets the record
export const _get = (name, table = 'Content') => {
  // console.log('get', name, store.get(Store), store.get(Store)[table] )
  return store.get(Store) && store.get(Store)[table] && store.get(Store)[table].find(e => e['Name'] == name)
}

// shortcut: Content Table > Content Field
export const _content = (name, fieldName = 'Content') => {
  // return empty text if loading / prepping for markdown
  return _get(name) && _get(name).fields && _get(name).fields[fieldName] || ''
}
export const _contents = (names) => {
  let obj = {}
  names.forEach(name => {
    obj[name] = _content(name)
  })

  return obj
}

