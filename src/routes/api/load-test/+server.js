
import { json } from '@sveltejs/kit';

import { loadBlogalog } from '../loadBlogalog.js'
import { loadBlogalogFromPath } from '$lib/blogalog'

export const GET = async (req) => {

  const pathUrl = req.url.hostname;
  
  let response = {banana: true}
  response = await loadBlogalog(req)
  // response = await loadBlogalogFromPath({ hostname: req.url.hostname })


  return json(response)
}
