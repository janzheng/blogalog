import { error } from '@sveltejs/kit'
import { head, seo } from '$lib/config.js'
import { PUBLIC_MULTIBLOG } from '$env/static/public';

import { loadBlogalogFromPath  } from '$lib/blogalog'
// import { cachet } from '$plasmid/utils/cachet'
// import { endo, endoloader } from '$plasmid/modules/cytosis2';


import { z } from 'zod';
// used for the Email.svelte form, but need to be refactored out
import { message, superValidate } from 'sveltekit-superforms/server';
const schema = z.object({
  notion: z.string(),
  email: z.string().email()
});




export const load = async (settings) => {
  try {
  
    let hostname = settings.url?.hostname
    let path = settings.params.path, subPath;
    let pathArr = settings.params.path.split('/')
    let _head, cytosis, isBlogalogHome, blogs;
    let parentData = await settings.parent()
    let pageContent

    console.log('[path/load] path array:', pathArr,)

    const form = await superValidate(schema);

    // is it a sub blog we've already loaded?
    if (parentData) {
      _head = parentData?.head
      cytosis = parentData?.cytosis
      blogs = parentData?.blogs
      pageContent = cytosis?.['site-pages']?.find(item => item.Path === path || item.Path === pathArr?.[pathArr?.length - 1]);

    }


    if (!pageContent && PUBLIC_MULTIBLOG == "true") {
      // if we want to enable "blogalog routing"
      // this loads blogs as SUB PATHS
      // otherwise we just get the data back from the layout
      // problem is sometimes you load blogalog/postSlug, it does NOT have parent data cached, so now you're loading both localhost AND a subpath post slug
      let newCytosis = await loadBlogalogFromPath({blogPath: pathArr[0], blogs}); // 
      if(newCytosis) {
        ({ _head, cytosis, isBlogalogHome } = newCytosis);
      }

      if (pathArr.length > 1) { // load a leaf blog instead of base blog
        pageContent = cytosis?.['site-pages']?.find(item => item.Path === path || item.Path === pathArr?.[pathArr?.length - 1]);


        let depth = 2
        if (pathArr.length > depth) { // deep path
          let index = depth-1
          pageContent = cytosis?.['site-pages']?.find(item => item.Path === path || item.Path === pathArr?.[index]);
          subPath = pathArr?.[depth]
          console.log("DEEP PATH --**", pathArr, subPath)  
        }
        path = pathArr[1]; // set the home path to the first one, e.g. jessbio only when in multiblog
        isBlogalogHome = false
      } else if (cytosis?.['site-data']) {
        // console.log("BASE POST", pathArr)  
        pageContent = cytosis?.['site-data'];
        path = pathArr[0]; // set the home path to the first one, e.g. jessbio only when in multiblog
      }
    }




    // console.log("PAGE SERVER PATH:", pathArr, path)
    let obj = {
      path: path,
      subPath,
      pathArr,
      form,
    }
    if(cytosis) obj['cytosis'] = cytosis;
    if(isBlogalogHome) obj['isBlogalogHome'] = isBlogalogHome;
    if(_head) obj['head'] = _head;
    if(pageContent) obj['pageContent'] = pageContent;

    if(!pageContent) {
      // console.error('[path/page] Page Content not Found!', JSON.stringify(cytosis, 0, 2))
      console.error('[path/page] Page Content not Found!')
      throw error(404, 'Page Not Found');
    }

    return obj
  } catch (err) {
    console.error('[page] router error', err, err.message)
  }

  throw error(404, 'Page Not Found');
}






