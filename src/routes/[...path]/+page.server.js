import { error } from '@sveltejs/kit'
// import { head, seo } from '$lib/config.js'
// import { PUBLIC_MULTIBLOG } from '$env/static/public';

import { loadBlogalogFromPath  } from '$lib/blogalog';

import { z } from 'zod';
// used for the Email.svelte form, but need to be refactored out
// import { message, superValidate } from 'sveltekit-superforms/server';
// const schema = z.object({
//   notion: z.string(),
//   email: z.string().email()//.default("stripe@example.com")
// });


// import builderClub from '$lib/data/builderclub.js';




export const load = async (params) => {
  // console.log('>>>>>> [...path]/+page.sever.js / load')
  console.log('<--- [path].page.server.js / load --->')
  try {
  
    // let hostname = settings.url?.hostname
    let path = params.params.path, subPath;
    let pathSegments = params.params.path.split('/')
    let head, blog, isBlogalogHome, blogalogPages;
    let pageContent;
    let pageGroup; // collections of paths that combine site data, e.g. main, post, and grid, under various path slugs, etc.

    console.log('[path/page.server.js/path/load] path array:', pathSegments)

    // not strictly necessary, but TODO: enable multiple predefined schemas, for layout, and per block type
    // const form = await superValidate(schema);


    // load data from parent (layout.server) or load fresh data from blogalog
    let freshBlogalog

    // is it a sub blog we've already loaded? Get this from layout.server (blocking / waterfall intentional)
    let parentData = await params.parent()
    if (parentData) {
      head = parentData?.head
      blog = parentData?.blog
      blogalogPages = parentData?.blogalogPages
      pageContent = blog?.['site-pages']?.find(item => item.Path === path || item.Path === pathSegments?.[pathSegments?.length - 1]);
      pageGroup = blog?.['site-pages']?.filter(item => item.PageGroups?.includes(path) || item.PageGroups?.includes(pathSegments?.[pathSegments?.length - 1]));
    }
    // console.log('---> parentData?', typeof parentData)

    // pages with 'Slug' that are allowed to be multi-blog
    let multiBlogSlugs = ['blogalog']

    // subpath routing, e.g. localhost:3055/ivom or 3055/ivom/something
    if (!pageContent && parentData && multiBlogSlugs.includes(parentData.blog?.slug)) {
      // if we want to enable "blogalog routing"
      // this loads blogs as SUB PATHS
      // otherwise we just get the data back from the layout
      // problem is sometimes you load blogalog/postSlug, it does NOT have parent data cached, so now you're loading both localhost AND a subpath post slug
      freshBlogalog = await loadBlogalogFromPath({ blogPath: pathSegments[0], blogalogPages }); // 
      
      if(freshBlogalog) {
        ({ head, blog, isBlogalogHome } = freshBlogalog);
      }

      if (pathSegments.length > 1) { // load a leaf blog instead of base blog
        // check for item.Path absolute paths — e.g. post paths (/blog-post) or component paths 
        pageContent = blog?.['site-pages']?.find(item => item.Path === path || item.Path === pathSegments?.[pathSegments?.length - 1]);
        pageGroup = blog?.['site-pages']?.filter(item => item.PageGroups?.includes(path) || item.PageGroups?.includes(pathSegments?.[pathSegments?.length - 1]));
        let depth = 2
        // console.log("PATH CHECK >>> ", pathSegments)  
        if (pathSegments.length > depth) { // deep path
          let index = depth-1
          pageContent = blog?.['site-pages']?.find(item => item.Path === path || item.Path === pathSegments?.[index]);
          pageGroup = blog?.['site-pages']?.find(item => item.PageGroups?.includes(path) || item.PageGroups?.includes(pathSegments?.[pathSegments?.length - 1]));
          subPath = pathSegments?.[depth]
          console.log("DEEP PATH ++++", pathSegments, subPath)  
        }
        path = pathSegments[1]; // set the home path to the first one, e.g. jessbio only when in multiblog
        isBlogalogHome = false
      } else if (blog?.['site-data']) {
        // console.log("BASE POST", pathSegments)  
        pageContent = blog?.['site-data'];
        path = pathSegments[0]; // set the home path to the first one, e.g. jessbio only when in multiblog
      }
    }


    // console.log("PAGE SERVER PATH:", pathSegments, path)
    let obj = {
      path: path,
      subPath,
      pathSegments,
      // form, // used for superValidate; done improperly here TODO
      srcLayout: false, // for tracking/provenance
      srcPathed: true, // for tracking/provenance
    }
    if (blog) obj['blog'] = blog;
    obj['isBlogalogHome'] = isBlogalogHome || false;
    if (head) obj['head'] = head;
    if (pageContent) obj['pageContent'] = pageContent;
    if (pageGroup) obj['pageGroup'] = pageGroup;

    if(!pageContent && !pageGroup) {
      // console.error('[path/page] Page Content not Found!', JSON.stringify(cytosis, 0, 2))
      console.error('[path/page] Page Content not Found!')
      throw error(404, 'Page Not Found');
    }

    console.log('<!--- [path].page.server.js / load --->')
    return obj;
  } catch (err) {
    console.error('[page] router error', err, err.message)
  }

  throw error(404, 'Page Not Found');
}






