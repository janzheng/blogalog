
/* 

  Resets the KV cache for blog pages
  Useful for testing; 
  
  Use /reload instead to force prod pages to get latest data

*/

import { json, error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { loadBlogalogFromPath } from '$lib/blogalog'
import { cacheClear } from "$plasmid/utils/cache.js";

import { PUBLIC_PROJECT_NAME, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_FUZZYKEY_URL } from '$env/static/public';
import { resetBlog, reloadBlog } from '$lib/server-helpers';


export async function GET({ url }) {
  try {

    // clear local cache!
    cacheClear();
    
    let hostname = url?.hostname;
    let blogalog = await loadBlogalogFromPath({ hostname });
    let blogalogPages=[];

    if (blogalog) {
      ({ blogalogPages } = blogalog);
    }


    // temp
    blogalogPages.push({Slug: `blogalog_config`})

    let blogList = []
    if(blogalogPages && blogalogPages.length > 0) {
      blogList = await Promise.all(blogalogPages.map(async blog => {
        let slug = `${PUBLIC_PROJECT_NAME}-${blog.Slug}`
        await resetBlog(slug);
        return slug;
      }));
    }
    
    return json({
      status: true,
      blogList,
    })
  } catch(e) {
    console.error('[api/reset] error', e)
    return errorjson(e)
  }
}
