import { error } from '@sveltejs/kit'
import { head, seo } from '$lib/config.js'
import { PUBLIC_MULTIBLOG } from '$env/static/public';

import { loadBlogalogFromPath  } from '$lib/blogalog'



export const load = async (settings) => {
  try {
    
    let path = settings.params.path;
    let pathArr = settings.params.path.split('/')
    let _head, cytosis, isBlogalog;
    let parentData = await settings.parent()
    let pageContent

    // is it a sub blog we've already loaded?
    if (parentData) {
      _head = parentData?.head
      cytosis = parentData?.cytosis
      pageContent = cytosis?.['site-pages'].find(item => item.Path === path || item.Path === pathArr?.[pathArr?.length - 1]);
    }

    if(!pageContent || PUBLIC_MULTIBLOG == "true") {
      // if we want to enable "blogalog routing"
      ({ _head, cytosis, isBlogalog } = await loadBlogalogFromPath(pathArr[0]));
      cytosis?.['site-pages'].find(item => item.Path === path || item.Path === pathArr?.[pathArr?.length - 1]);
    }

    let obj = {
      path: path,
      pathArr,
    }
    if(cytosis) obj['cytosis'] = cytosis;
    if(isBlogalog) obj['isBlogalog'] = isBlogalog;
    if(_head) obj['head'] = _head;
    if(pageContent) obj['pageContent'] = pageContent;

    if(!pageContent) {
      throw error(404, 'Page Not Found');
    }

    return obj
  } catch (err) {
    console.error('[page] router error', err.message)
  }

  throw error(404, 'Page Not Found');
}
