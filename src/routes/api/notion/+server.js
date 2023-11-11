
// test getters for notion
// also check out notion-test.js
// this one doesn't directly use notions api


import { json, error } from '@sveltejs/kit';
import { getDbPage, updatePage } from '$lib/notion.js'


// testing getdb endpoints
export const GET = async (request) => {
  request = {
    // returns blogalog home page; isBlogalogHome = true
    url: { hostname: "ivom.phage.directory" },
    params: { }
  }

  let page = await getDbPage(request, "kale", {
    property: "Name",
    rich_text: {
      equals: "Tuscan Kale"
    }
  })
  let result = page.results[0]
  if (!result) return;

  // result = await updatePage(result.id, {
  //   'Description': {
  //     "rich_text": [
  //       {
  //         "text": {
  //           "content": "HELLO JESSICA!!!!! FREEDOM!!!"
  //         }
  //       }
  //     ]
  //   },
  // })
  return json(result)
}




// export const GET = async (request) => {
//   let page = await getDbPage(request, {
//     property: "Name",
//     rich_text: {
//       equals: "Tuscan Kale"
//     }
//   })
//   let result = page.results[0]
//   if (!result) return;

//   result = await updatePage(result.id, {
//     'Description': {
//       "rich_text": [
//         {
//           "text": {
//             "content": "HELLO JESSICA!!!!! FREEDOM!!!"
//           }
//         }
//       ]
//     },
//   })
//   return json(result)
// }
