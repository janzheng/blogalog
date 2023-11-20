
import { json } from '@sveltejs/kit';

import { loadBlogalog, loadBlogalogFromPageId, buildBlogPage, buildBlogHead } from '$lib/blogalog'
// import { loadBlogalog } from '../loadBlogalog.js'

/* 

  This file is to make sense of the massively confusing blogalog fns I've made

*/



export const GET = async (req) => {
  let response, blogalogData;

  // TESTS
  // loads base blogs index (e.g. blogalog.net index)
  // response = await loadBlogalogFromPath({hostname: "/"})

  // returns root source of the current site (localhost, or blogalog.net, etc.)
  // response = await loadBlogalogFromPath({hostname: "ivom.phage.directory"})

  // loads base blogs index + sub blog hosted on blogalog (e.g. blogalog.net/yawnxyz)
  // response = await loadBlogalogFromPath({ hostname: "/", blogPath: "yawnxyz" })



  // CONFIGURATION TESTS
  // configuration 1: localhost:3055/yawnxyz/biobank-db
  // let hostname = "/", blogPath = "yawnxyz", slug = "biobank-db", post;

  // configuration 2: https://janzheng.com/biobank-db
  // (results should be equivalent to configuration 1)
  // let hostname = "https://janzheng.com", blogPath = null, slug = "biobank-db", post;

  // blogalogData = await loadBlogalogFromPath({ hostname, blogPath: "yawnxyz" })
  // if(slug) {
  //   // load a specific page post from a slug
  //   post = blogalogData?.blog?.['site-pages']?.find(item => item.Path === slug);
  // }

  // testing
  // blogalogData = await loadBlogalog({ 
  //   req: {
  //     // returns blogalog home page; isBlogalogHome = true
  //     url: { hostname: "localhost" },
  //     params: { },

  //     // returns yawnxyz as sub blog
  //     // url: { hostname: "localhost" },
  //     // params: { path: "yawnxyz" },

  //     // returns yawnxyz as sub blog w/ blog post
  //     // url: { hostname: "localhost" },
  //     // params: { path: "yawnxyz/biobank-db" },

  //     // returns yawnxyz as main blog
  //     // url: { hostname: "janzheng.com" },
  //     // params: { },

  //     // returns yawnxyz as main blog w/ blog post
  //     // url: { hostname: "janzheng.com" },
  //     // params: { path: "biobank-db" },

  //     // returns blog list on failure
  //     // url: { hostname: "localhost:3055" },
  //     // params: { path: "banana" }
  //   } 
  // })

  blogalogData = await loadBlogalogFromPageId({ pageId: "64c8b0211d2a4e85939c679e8002ab8d" })
  let blog = buildBlogPage(blogalogData)
  let head = buildBlogHead(blog)
  response = {blog, head}


  // response = blogData
  // response = await loadBlogalog(req)
  // response = await loadBlogalogFromPath({ hostname: req.url.hostname })

  return json(response)
}

