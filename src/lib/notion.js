
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


// gets a notion db page from a blogalog-secret-id relay
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

export const addPage = async (req, dbName, { icon, cover, data, schema }={}) => {
  let dbId = await getDbId(req, dbName)
  const response = await notion.pages.create(await convertToNotionPageObject({ 
    dbId, 
    icon: icon || "🍌", 
    cover, 
    data, 
    schema 
  }));

  return response;
}





export const notionRichTextToHTML = (richText) => {
  if(!richText || richText.length == 0) return null;
  
  let html = '';
  for (let item of richText) {
    let content = item.text.content;

    // Check and apply annotations
    if (item.annotations) {
      const { bold, italic, strikethrough, underline, code, color } = item.annotations;
      if (bold) content = `<b>${content}</b>`;
      if (italic) content = `<i>${content}</i>`;
      if (strikethrough) content = `<s>${content}</s>`;
      if (underline) content = `<u>${content}</u>`;
      if (code) content = `<code>${content}</code>`;
      if (color !== 'default') content = `<span style="color:${color}">${content}</span>`;
    }

    html += content;
  }
  return html;
}




export const notionObjToFlatJson = (notionObject) => {
  let flatJson = {};
  let dbProperties = notionObject.properties

  for (const key in dbProperties) {
    if (dbProperties.hasOwnProperty(key)) {
      const property = dbProperties[key];
      flatJson[key] = {
        id: property.id,
        // name: property?.name,
        type: property.type
      };

      // console.log(`[notionObjToFlatJson]: ${key}:`, property)
      switch (property.type) {
        case "title":
          flatJson[key].value = property.title[0].text.content;
          break;
        case "checkbox":
          flatJson[key].value = property.checkbox;
          break;
        case "number":
          flatJson[key].value = property.number;
          break;
        case "email":
          flatJson[key].value = property.email;
          break;
        case "url":
          flatJson[key].value = property.url;
          break;
        case "created_by":
          flatJson[key].value = property.created_by;
          break;
        case "created_time":
          flatJson[key].value = property.created_time;
          break;
        case "last_edited_time":
          flatJson[key].value = property.last_edited_time;
          break;
        case "date":
          flatJson[key].value = property.date;
          break;
        case "phone_number":
          flatJson[key].value = property.phone_number;
          break;
        case "select":
          flatJson[key].value = property.select?.name;
          break;
        case "multi_select":
          flatJson[key].value = property.multi_select.map(item => item?.name);
          break;
        case "unique_id":
          flatJson[key].value = property.unique_id.prefix + property.unique_id.number;
          break;
        case "status":
          flatJson[key].value = property.status?.name;
          break;
        case "files":
          flatJson[key].value = property.files.map(file => {
            return {
              name: file?.name,
              url: file.file.url || file.file.external.url
            }
          });
          break;
        case "rich_text":
          flatJson[key].value = notionRichTextToHTML(property.rich_text);
      }

      // do we only want to output the value instead of types?
      flatJson[key] = flatJson[key].value
    }
  }

  return flatJson;
}









export const convertToNotionPageObject = async ({ dbId, icon = "🥬", cover, data, schema }) => {

  if(!schema) {
    schema = createSchemaFromResponse(await notion.databases.retrieve({ database_id: dbId }));
  }

  const notionPageObject = {
    "icon": {
      "type": "emoji",
      "emoji": icon || "🥬"
    },
    "cover": {
      "type": "external",
      "external": {
        "url": cover || "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
      }
    },
    "parent": {
      "type": "database_id",
      "database_id": dbId
    },
  };

  let properties = {}
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) { // only check for direct schema props
      const notionPropertyType = schema[key];
      if (data[key]) {
        // console.log('converting....', key, data[key])
        properties[key] = convertToNotionProperty(data[key], notionPropertyType);
      }
    }
  }
  notionPageObject["properties"] = properties;

  return notionPageObject;
}

export const convertToNotionProperty = (value, type) => {
  switch (type) {
    case 'title':
    case 'rich_text':
      return {
        [type]: [
          {
            text: {
              content: value
            }
          }
        ]
      };
    case 'date':
      return {
        date: {
          start: value.start || value,
          end: value.end || null
        }
      };
    case 'email':
      return {
        email: value
      };
    case 'phone_number':
      return {
        phone_number: value
      };
    case 'status':
      return {
        status: { name: value }
      }
    case 'files':
      const filesArray = value.map(fileUrl => ({
        type: "external",
        name: fileUrl.split('/').pop(), // Extract file name from URL
        external: { url: fileUrl }
      }));
      return {
        files: filesArray
      };
    case 'checkbox':
      return {
        checkbox: value
      };
    case 'multi_select':
      return {
        multi_select: value.map(option => ({ name: option }))
      };
    case 'number':
      return {
        number: value
      };
    case 'select':
      return {
        select: { name: value }
      };
    case 'url':
      return {
        url: value
      };
    default:
      return { [type]: value };
  }
}

export const createSchemaFromResponse = (response) => {
  const properties = response.properties;
  const schema = {};

  for (const key in properties) {
    if (properties.hasOwnProperty(key)) {
      schema[key] = properties[key].type;
    }
  }

  return schema;
}


