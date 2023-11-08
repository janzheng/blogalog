

import { fail } from '@sveltejs/kit';

import { z } from 'zod';
import { endo, endoloader } from '$plasmid/modules/cytosis2';
import { message, superValidate } from 'sveltekit-superforms/server';
const schema = z.object({
  // name: z.string().default('Hello world!?'),
  notion: z.string(),
  // email: z.string().email().default('hello@example.com')
  email: z.string().email()
});

export const actions = {
  email: async ({ request }) => {
    const form = await superValidate(request, schema);
    // console.log('POST', form);

    if (!form.valid) {
      // Again, always return { form } and things will just work.
      return fail(400, { form });
    }

    let emailData;
    if (form?.data?.notion) {
      let email = form?.data?.email
      emailData = await endo({
        "sources": [
          {
            "name": "users",
            "type": "cfnotion",
            "path": `/collection/${form?.data?.notion}`,
            "loaders": {
              "notionPageId": "id"
            },
          },
        ]
      })
      // console.log('srcData::', emailData)
      let users = emailData.users
      // find email in emailData.users
      let user = users.find(user => user.Email === email)
      if (!user) {
        return message(form, `Email doesn't exist`, { status: 400 });
      }
      return { form }

    }


    // TODO: Do something with the validated form.data

    // Yep, return { form } here too
    return { form };
  }
};