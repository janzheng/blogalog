import { error } from '@sveltejs/kit'
import { head, seo } from '$lib/config.js'
import { PUBLIC_MULTIBLOG } from '$env/static/public';

import { loadBlogalogFromPath } from '$lib/blogalog'



export const load = async (settings) => {

  // let hostname = settings.url?.hostname
  let path = settings.params.path, subPath;
  let pathSegments = settings.params.path.split('/')
  let head, blog, isBlogalogHome, blogalogPages;
  let parentData = await settings.parent()
  let pageContent

  console.log('[path/page.server.js/path/load] path array:', pathSegments)

  // is it a sub blog we've already loaded?
  if (parentData) {
    head = parentData?.head
    blog = parentData?.blog
    blogalogPages = parentData?.blogalogPages
    pageContent = blog?.['site-pages']?.find(item => item.Path === path || item.Path === pathSegments?.[pathSegments?.length - 1]);

  }


  if (!pageContent && PUBLIC_MULTIBLOG == "true") {
    // if we want to enable "blogalog routing"
    // this loads blogs as SUB PATHS
    // otherwise we just get the data back from the layout
    // problem is sometimes you load blogalog/postSlug, it does NOT have parent data cached, so now you're loading both localhost AND a subpath post slug
    let freshBlogalog = await loadBlogalogFromPath({ blogPath: pathSegments[0], blogalogPages }); // 
    if (freshBlogalog) {
      ({ head, blog, isBlogalogHome } = freshBlogalog);
    }

    if (pathSegments.length > 1) { // load a leaf blog instead of base blog
      pageContent = blog?.['site-pages']?.find(item => item.Path === path || item.Path === pathSegments?.[pathSegments?.length - 1]);


      let depth = 2
      if (pathSegments.length > depth) { // deep path
        let index = depth - 1
        pageContent = blog?.['site-pages']?.find(item => item.Path === path || item.Path === pathSegments?.[index]);
        subPath = pathSegments?.[depth]
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
    hideFooter: true,
  }
  // if(blog) obj['cytosis'] = blog;
  if (blog) obj['blog'] = blog;
  if (isBlogalogHome) obj['isBlogalogHome'] = isBlogalogHome;
  if (head) obj['head'] = head;
  if (pageContent) obj['pageContent'] = pageContent;

  if (!pageContent) {
    // console.error('[path/page] Page Content not Found!', JSON.stringify(cytosis, 0, 2))
    console.error('[path/page] Page Content not Found!')
    throw error(404, 'Page Not Found');
  }

  return obj
}