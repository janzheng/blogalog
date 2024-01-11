
/* 

loads a blogaglog and returns what load() usually returns, but as data

*/


import { head, seo } from '$lib/config.js'
import { hjson, errorjson } from '$plasmid/utils/sveltekit-helpers'
import { json } from '@sveltejs/kit';
// import { loadContent } from '$lib/load-helpers.js'
import { buildBlogalogsFromPageId } from '$lib/blogalog.js'


export const GET = async ({ request }) => {
  try {
    let result = await buildBlogalogsFromPageId('5377a6129444406f9872d1244aacdfd6');
    return hjson({ success: true, result })
    // return result;
  }
  catch (err) {
    console.error('[api/loadBlog] error:',err)
    throw errorjson(500, err)
  }
}