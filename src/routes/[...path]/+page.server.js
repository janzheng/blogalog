import { error } from '@sveltejs/kit'
import { head, seo } from '$lib/config.js'
import { PUBLIC_MULTIBLOG } from '$env/static/public';

import { loadBlogalogFromPath  } from '$lib/blogalog'



export const load = async (settings) => {
  try {
    

    let hostname = settings.url?.hostname
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

    if (!pageContent || PUBLIC_MULTIBLOG == "true") {
      // if we want to enable "blogalog routing"
      // this loads blogs as SUB PATHS
      // otherwise we just get the data back from the layout
      let newCytosis = await loadBlogalogFromPath(pathArr[0]); // 
      if(newCytosis) {
        ({ _head, cytosis, isBlogalog } = newCytosis);
      }
      if (cytosis?.['site-data'])
        pageContent = cytosis?.['site-data'];
      // pageContent = cytosis?.['site-pages'].find(item => item.Path === path || item.Path === pathArr?.[pathArr?.length - 1]);
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
      console.error('[path/page] Page Content not Found!', JSON.stringify(cytosis, 0, 2))
      throw error(404, 'Page Not Found');
    }

    return obj
  } catch (err) {
    console.error('[page] router error', err, err.message)
  }

  throw error(404, 'Page Not Found');
}
