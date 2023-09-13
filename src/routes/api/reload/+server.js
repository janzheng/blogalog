
import { json, error } from '@sveltejs/kit'
import { cachedjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { loadBlogalogFromPath } from '$lib/blogalog'
import { PUBLIC_PROJECT_NAME, PUBLIC_ENDOCYTOSIS_URL, PUBLIC_FUZZYKEY_URL } from '$env/static/public';

async function resetBlog(key) {
  const url = `${PUBLIC_FUZZYKEY_URL}/?key=${key}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log('[api/reload]: reset 👍', key)
  return true
}


// just call endloader directly here; skip blogalogloader
async function reloadBlog(blog) {
  let endoloader_config = {
    "sources": [
      {
        "name": "site-pagedata",
        "type": "cfnotion",
        "path": `/collection/${blog['Pagedata ID']}`,
        "loaders": {
          "notionPageId": "id"
        },
      },
    ]
  }

  // no async; just let the server do its job; will finish in about 30s
  // let data = await endoloader(endoloader_config, {
  endoloader(endoloader_config, {
    key: `${PUBLIC_PROJECT_NAME}-${blog['Slug']}`,
    url: PUBLIC_ENDOCYTOSIS_URL,
  })
  // return data

  // await loadBlogalogFromPath({blogPath: key, blogs})
  console.log('[api/reload]: reloaded 👍', blog['Slug'])
  return true
}











export async function GET({ url }) {
  try {
    console.time('[api/reload] Total reload time');
    let hostname = url?.hostname;
    let blogalog = await loadBlogalogFromPath({ hostname });
    let blogs=[];

    if (blogalog) {
      ({ blogs } = blogalog);
    }

    // note we don't reset the blogalog_config!!

    let blogList = []
    if(blogs && blogs.length > 0) {
      blogList = await Promise.all(blogs.map(async blog => {
        let slug = `${process.env.PUBLIC_PROJECT_NAME}-${blog.Slug}`
        await resetBlog(slug);
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
