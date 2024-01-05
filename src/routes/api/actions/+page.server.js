

import { fail } from '@sveltejs/kit';

import { z } from 'zod';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { addPage, getDbPage, notionObjToFlatJson } from '$lib/notion.js'
import { message, superValidate } from 'sveltekit-superforms/server';
// maybe use z.record(z.string()) instead?
const schema = z.object({
  notion: z.string(),
  hostname: z.string(),

  // Use this to constrain to certain field Names / types in forms
  schema: z.string().optional(),
  Name: z.string().optional(),
  Email: z.string().email().optional(),
  // Banana: z.string().optional(),

  // Any other key-value pairs
});
// const schema = z.record(z.unknown())




export const actions = {

  // flexible data entry 
  dataEntry: async (req) => {
    const formData = await req.request.formData();
    const entries = Object.fromEntries(formData);
    let form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }


    // return message(form, `Success`, { status: 200 });


    if (form?.data?.notion) {
      req.url.hostname = form?.data?.hostname

      let data = {}
      let formSchema = JSON.parse(form?.data?.schema)
      formSchema.forEach(item => {
        if (item.required && !entries?.[item.name]) {
          return fail(400, { message: `${item.name} is missing` });
        }
        data[item.name] = entries?.[item.name]
      });

      // Add any other keys from form?.data to data
      for (let key in entries) {
        if (entries[key] && !data[key]) {
          data[key] = entries[key]
        }
      }

      console.log('DATA ENTRYYY', req.url.hostname, form?.data, entries, data)
      let page = await addPage(req, form?.data?.notion, { data })

      // let user = notionObjToFlatJson(record);
      // return { form, page }
      return message(form, `Success`, { status: 200 });

    }

    // Yep, return { form } here too
    // return { form };
    return message(form, `Notion error`, { status: 400 });
  },






  // login through email form
  login: async (req) => {
    const form = await superValidate(req.request, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    if (form?.data?.notion) {
      // req.url.hostname = "ivom.phage.directory" // testing
      // req.url.hostname = "www.blogalog.net" // testing
      req.url.hostname = form?.data?.hostname
    // note that the hostname of the site, e.g. ivom.phage.directory needs to match
    // by design this should NOT work on blogalog.net/ivom since that might open up fraudulent signins

      // console.log('value::::', form?.data?.Email, req.url.hostname)

      // for this to work, make sure there's a Secrets key and secret Notion db w/ Whimsy API connected
      // that will relay the key to the real db w/ the API
      let page = await getDbPage(req, form?.data?.notion, {
        property: "Email",
        rich_text: {
          equals: form?.data?.Email
        }
      })

      let record = page?.results[0];

      console.log('page?.results:::', page?.results, form?.data?.Email)

      if (!record) {
        return message(form, `Email doesn't exist`, { status: 400 });
      }

      let user = notionObjToFlatJson(record);
      return { form, user }

    }


    // TODO: Do something with the validated form.data

    // Yep, return { form } here too
    // return { form };
    return message(form, `Notion error`, { status: 400 });
  }
};