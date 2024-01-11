
/* 

  Reloads a blog site like /api/reload/jessbio

*/

import { json, error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { cacheClear } from "$plasmid/utils/cache.js";

import { PUBLIC_PROJECT_NAME, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_FUZZYKEY_URL } from '$env/static/public';
import { deleteBlogCache, reloadBlog } from '$lib/server-helpers';


export async function GET({ url, params }) {
  try {
    let path = params.path;
    let pageDataId = url.searchParams.get('pageDataId');
    // console.log("PATH::::", path, pageDataId)
    let hostname = url?.hostname;

    let slug = `${PUBLIC_PROJECT_NAME}-${path}`

    let oldData = await fetch(`${PUBLIC_FUZZYKEY_URL}/?key=${slug}&metadata=true`);
    let oldDataJson
    try {
      oldDataJson = await oldData.json();
      // console.log('[api/reset] path:', path, oldDataJson)
    } catch(e) {
      console.error('[api/reset] error', e)
      // return errorjson(e)a
    }

    // clear local cache!
    cacheClear();

    console.log('resetting blog', slug)
    await deleteBlogCache(slug);

    // send off w/o waiting
    reloadBlog(path, pageDataId);
    
    return json({
      status: true,
      path,
      created: oldDataJson?.metadata?.created
    })
  } catch(e) {
    console.error('[api/reset] error', e)
    return errorjson(e)
  }
}
