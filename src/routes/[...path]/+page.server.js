import { error } from '@sveltejs/kit'
import { head, seo } from '$lib/config.js'
import { PUBLIC_CY_BLOGALOG } from '$env/static/public';

import { loadBlogalogFromPath  } from '$lib/blogalog'



export const load = async (settings) => {
  try {
    
    let path = settings.params.path;
    let pathArr = settings.params.path.split('/')
    let _head, cytosis, isBlogalog;

    console.log('Path is', path)

    // if we want to enable "blogalog routing"
    if(PUBLIC_CY_BLOGALOG == "true") {
      ({ _head, cytosis, isBlogalog } = await loadBlogalogFromPath(pathArr[0]));
    }

    let obj = {
      path: path,
      pathArr,
    }
    if(cytosis) obj['cytosis'] = cytosis;
    if(isBlogalog) obj['isBlogalog'] = isBlogalog;
    if(_head) obj['head'] = _head;

    return obj
  } catch (err) {
    console.error('[page] router error', err.message)
    // throw errorjson(404, err)
  }
}
