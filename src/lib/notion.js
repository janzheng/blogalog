
import { NOTION_API } from '$env/static/private';
import { Client } from '@notionhq/client';
import { loadBlogalog } from '$lib/blogalog'
const notion = new Client({ auth: NOTION_API });



// takes a request object and returns the database id
// attempts to check for blogalog "Secrets" first as a "relay"
// these are values that point to a non-public db, and the real db id is pulled
// using a whimsy API integration instead of the CF notion worker
// this lets you keep the secrets DB non-public 
export const getDbId = async (req, dbName ='notion-db-id') => {
  // loads the blogalog based on the current request / url
  let blogalog = await loadBlogalog({req})
  if (!blogalog || !blogalog.siteData) throw new Error(`Blogalog Not found for ${dbName}`)

  let dbid;
  if (blogalog.secrets?.[dbName]) {
    // database relay; get the database id from the secret database page
    let relayDbId = blogalog.secrets?.[dbName]?.['Content']
    console
    const response = await notion.databases.query({
      database_id: relayDbId,
      filter: {
        property: "Name",
        rich_text: {
          equals: dbName
        }
      },
    });
    dbid = response.results?.[0]?.properties.Content.rich_text[0].text.content
  } else {
    dbid = blogalog.siteData[dbName]?.['Content'];
  }
  return dbid;
}


export const getDbPage = async (req, dbName, filter) => {
  let dbid = await getDbId(req, dbName)
  if(dbid) {
    const response = await notion.databases.query({
      database_id: dbid,
      filter: filter,
    });
  
    return response
  }
}

export const updatePage = async (pageId, properties) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties
  });
  return response
}
