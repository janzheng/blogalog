
import { NOTION_API } from '$env/static/private';
import { Client } from '@notionhq/client';
import { loadBlogalog } from '../loadBlogalog.js'
const notion = new Client({ auth: NOTION_API });


export const getDbId = async (request) => {
  let blogalog = await loadBlogalog(request)
  if (!blogalog || !blogalog.pageContent) return error({ status: 404, message: 'Blogalog Not found' })
  // let pageData = blogalog.pageContent
  let dbid = blogalog.pageContent['notion-db-id']?.['Content']
  return dbid
}

export const getDbPage = async (request, filter) => {
  let dbid = await getDbId(request)

  const response = await notion.databases.query({
    database_id: dbid,
    filter: filter,
  });

  return response
}

export const updatePage = async (pageId, properties) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties
  });
  return response
}
