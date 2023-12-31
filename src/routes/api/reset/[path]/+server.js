

// performs reset on something like /api/reset/jessbio


import { json, error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { cacheClear } from "$plasmid/utils/cache.js";

import { PUBLIC_PROJECT_NAME, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_FUZZYKEY_URL } from '$env/static/public';
import { deleteBlogCache, reloadBlog } from '$lib/server-helpers';


export async function GET({ url, params }) {
  try {
    let path = params.path;
    let hostname = url?.hostname;

    console.log('[api/reset] path:', path)

    // clear local cache!
    cacheClear();

    let slug = `${PUBLIC_PROJECT_NAME}-${path}`
    await deleteBlogCache(slug);
    
    return json({
      status: true,
      slug,
    })
  } catch(e) {
    console.error('[api/reset] error', e)
    return errorjson(e)
  }
}
