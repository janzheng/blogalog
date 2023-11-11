

import { fail } from '@sveltejs/kit';

import { z } from 'zod';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { getDbPage } from '$lib/notion.js'
import { message, superValidate } from 'sveltekit-superforms/server';
const schema = z.object({
  // name: z.string().default('Hello world!?'),
  notion: z.string(),
  // email: z.string().email().default('hello@example.com')
  email: z.string().email()
});

function notionRichTextToHTML(richText) {
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

function notionToFlatJson(notionObject) {
  let flatJson = {};
  let dbProperties = notionObject.properties

  for (const key in dbProperties) {
    if (dbProperties.hasOwnProperty(key)) {
      const property = dbProperties[key];
      flatJson[key] = {
        id: property.id,
        // name: property.name,
        type: property.type
      };

      console.log(`${key}:`, property)
      switch(property.type) {
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
          flatJson[key].value = property.select.name;
          break;
        case "multi_select":
          flatJson[key].value = property.multi_select.map(item => item.name);
          break;
        case "unique_id":
          flatJson[key].value = property.unique_id.prefix + property.unique_id.number;
          break;
        case "status":
          flatJson[key].value = property.status.name;
          break;
        case "files":
          flatJson[key].value = property.files.map(file => {
            return {
              name: file.name,
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




export const actions = {

  // login through email form
  email: async (req) => {
    const form = await superValidate(req.request, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    if (form?.data?.notion) {
      req.url.hostname = "ivom.phage.directory" // testing

      // for this to work, make sure there's a Secrets key and secret Notion db w/ Whimsy API connected
      // that will relay the key to the real db w/ the API
      let page = await getDbPage(req, form?.data?.notion, {
        property: "Email",
        rich_text: {
          equals: form?.data?.email
        }
      })
      let record = page?.results[0];
      let user = notionToFlatJson(record);


      if (!user) {
        return message(form, `Email doesn't exist`, { status: 400 });
      }

      return { form, user }

    }


    // TODO: Do something with the validated form.data

    // Yep, return { form } here too
    // return { form };
    return message(form, `Notion error`, { status: 400 });
  }
};