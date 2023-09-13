
import { json, error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { loadBlogalogFromPath } from '$lib/blogalog'

import { PUBLIC_PROJECT_NAME, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_FUZZYKEY_URL } from '$env/static/public';


async function resetBlog(key) {
  const url = `${PUBLIC_FUZZYKEY_URL}/?key=${key}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log('[api/reset]: reset 👍', key)
  return true
}


export async function GET({ url }) {
  try {
    let hostname = url?.hostname;
    let blogalog = await loadBlogalogFromPath({ hostname });
    let blogs=[];

    if (blogalog) {
      ({ blogs } = blogalog);
    }

    // clear local cache!
    cacheClear();
    
    // temp
    blogs.push({Slug: `blogalog_config`})

    let blogList = []
    if(blogs && blogs.length > 0) {
      blogList = await Promise.all(blogs.map(async blog => {
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
