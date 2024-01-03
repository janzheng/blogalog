
import { json, error } from '@sveltejs/kit'
import { PUBLIC_PROJECT_NAME, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_FUZZYKEY_URL } from '$env/static/public';
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { cacheClear } from "$plasmid/utils/cache.js";

import { loadBlogalogFromPath } from '$lib/blogalog';
import { deleteBlogCache, reloadBlog } from '$lib/server-helpers';


export async function GET({ url }) {
  try {

    // clear local cache!
    cacheClear();
    await deleteBlogCache(`${PUBLIC_PROJECT_NAME}-${"blogalog_config"}`);

    console.time('[api/reload] Total reload time');
    let hostname = url?.hostname;
    let blogalog = await loadBlogalogFromPath({ hostname });
    let blogalogPages=[];

    if (blogalog) {
      ({ blogalogPages } = blogalog);
    }

    // note we don't reset the blogalog_config!!

    let blogList = []
    if(blogalogPages && blogalogPages.length > 0) {
      blogList = await Promise.all(blogalogPages.map(async blog => {
        let slug = `${PUBLIC_PROJECT_NAME}-${blog.Slug}`
        await deleteBlogCache(slug);
        await reloadBlog(blog);
        return slug;
      }));
    }
    
    console.timeEnd('[api/reload] Total reload time');
    console.log('[api/reload] Ok all done!', blogList);

    return json({
      status: true,
      blogList,
    })
  } catch(e) {
    console.error('[api/ereload] error', e)
    return errorjson(e)
  }
}
