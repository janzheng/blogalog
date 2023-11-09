

import { json, error } from '@sveltejs/kit';
import { getDbPage, updatePage } from './utils.js'


export const GET = async (request) => {
  let page = await getDbPage(request, {
    property: "Name",
    rich_text: {
      equals: "Tuscan Kale"
    }
  })
  let result = page.results[0]
  if (!result) return;

  result = await updatePage(result.id, {
    'Description': {
      "rich_text": [
        {
          "text": {
            "content": "HELL JESSICA!!!!! FREEDOM!!!"
          }
        }
      ]
    },
  })


  return json(result)
}
