
import { json, error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { loadBlogalogFromPath } from '$lib/blogalog'

async function resetBlog(key) {
  const url = `${process.env.PUBLIC_FUZZYKEY_URL}/?key=${key}`;
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
    let _head, cytosis, blogs=[];

    if (blogalog) {
      ({ _head, cytosis, blogs } = blogalog);
    }

    // temp
    blogs.push({Slug: `blogalog_config`})

    let blogsReset = []
    if(blogs && blogs.length > 0) {
      blogsReset = await Promise.all(blogs.map(async blog => {
        let slug = `${process.env.PUBLIC_PROJECT_NAME}-${blog.Slug}`
        await resetBlog(slug);
        return slug;
      }));
    }
    
    return json({
      status: true,
      blogsReset,
    })
  } catch(e) {
    console.error('[api/reset] error', e)
    return errorjson(e)
  }
}
