
// // head comes from here usually:
// import { head, seo } from '$lib/config.js'


// import { PUBLIC_BLOGMODE } from '$env/static/public';

// import { loadBlogalogFromPath } from '$lib/blogalog'



// export function removePrefixFromHostname(url) {
//   if(!url) return null
//   let hostname = url.hostname;

//   if(!hostname) return null

//   // Use a regular expression to remove any prefixes
//   hostname = hostname.replace(/^(www\.|blog\.|subdomain\.)+/i, '');
//   return hostname;
// }




// export async function initContent(head, hostname) {
//   console.log('[+layout.server/initContent] initializing:', 'host:', hostname)
//   let blog, config, mode, blogalogPages
//   let blogalog = await loadBlogalogFromPath({ hostname });

//   if (blogalog) {
//     ({ head, blog, blogalogPages } = blogalog);
//   } else {
//     // NOTE: don't do this if on a subpath; or maybe just don't do this at all?
//     // otherwise will load base blog AND sub blog, which is slowwww
//     // for default or wrong hostnames, pull default blogalog
//     // console.error('[layout] No custom blog or page found; defaulting to load [BLOGALOG]')
//     // blogalog = await loadBlogalogFromPath("blogalog");
//     // if (blogalog) ({ _head, cytosis } = blogalog);
//   }

//   if (!blogalog) {
//     // this happens on preview paths, where the hostname is not the same as the blogalog
//     // this will load the "preview" mode which is normally blogalog (Set on "pages")
//     blogalog = await loadBlogalogFromPath({ hostname: "preview" });
//     ({ head, blog, blogalogPages } = blogalog);
//   }

//   return { blog, head, blogalogPages }
// }

// export async function loadContent(url, params, head, hostname) {
//   // let {cytosis, _head} = await initContent(head)
//   console.log(`\n<-- loadContent ${hostname} -->\n`)
//   let blog, blogalogPages
//   ({ blog, head, blogalogPages } = await initContent(head, hostname)); // don't cachet here; leave cachet strategy to blogalogloader or other loaders

//   let returnObj = {
//     path: params?.path,
//     pathSegments: params?.path?.split('/'),
//     hostname,
//     origin: url?.origin,
//     plainUrl: removePrefixFromHostname(url),

//     head: head,
//     // seo: seo, // need to generalize this more
//     blog,
//     blogalogPages,
//   };
//   console.log(`\n</-- +layout.server.js / finished ${hostname} -->\n`)
//   return returnObj;
// }
