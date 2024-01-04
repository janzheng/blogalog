

import { fail } from '@sveltejs/kit';

import { z } from 'zod';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { getDbPage, notionObjToFlatJson } from '$lib/notion.js'
import { message, superValidate } from 'sveltekit-superforms/server';
const schema = z.object({
  // name: z.string().default('Hello world!?'),
  notion: z.string(),
  // email: z.string().email().default('hello@example.com')
  email: z.string().email()
});




export const actions = {

  // register 
  // login: async (req) => {
  //   const form = await superValidate(req.request, schema);

  //   if (!form.valid) {
  //     return fail(400, { form });
  //   }

  //   if (form?.data?.notion) {
  //     req.url.hostname = "ivom.phage.directory" // testing

  //     // for this to work, make sure there's a Secrets key and secret Notion db w/ Whimsy API connected
  //     // that will relay the key to the real db w/ the API
  //     let page = await getDbPage(req, form?.data?.notion, {
  //       property: "Email",
  //       rich_text: {
  //         equals: form?.data?.email
  //       }
  //     })
  //     let record = page?.results[0];

  //     if (!record) {
  //       return message(form, `Email doesn't exist`, { status: 400 });
  //     }

  //     let user = notionObjToFlatJson(record);
  //     return { form, user }

  //   }


  //   // TODO: Do something with the validated form.data

  //   // Yep, return { form } here too
  //   // return { form };
  //   return message(form, `Notion error`, { status: 400 });
  // },

  // login through email form
  login: async (req) => {
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