

// test page for notion-api 


import { json } from '@sveltejs/kit';
import { NOTION_API } from '$env/static/private';

import { Client } from '@notionhq/client';
const notion = new Client({ auth: NOTION_API });

import { convertToNotionPageObject  } from "$lib/notion.js"

const dbId = "b05b399b60be45d9bf158ef4b44368c8"
const pageId = "e973d4268b554dd59f8cbf99320ff629";



// export const GET = async ({ request }) => {

//   const response = await notion.pages.create({
//     "cover": {
//       "type": "external",
//       "external": {
//         "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
//       }
//     },
//     "icon": {
//       "type": "emoji",
//       "emoji": "🥬"
//     },
//     "parent": {
//       "type": "database_id",
//       "database_id": dbId
//     },
//     "properties": {
//       "Name": {
//         "title": [
//           {
//             "text": {
//               "content": "Tuscan kale 123"
//             }
//           }
//         ]
//       },
//       "Description": {
//         "rich_text": [
//           {
//             "text": {
//               "content": "A dark green leafy vegetable"
//             }
//           }
//         ]
//       },
//       "Food group": {
//         "select": {
//           "name": "🥬 Vegetable"
//         }
//       }
//     },
//     // "children": [
//     //   {
//     //     "object": "block",
//     //     "heading_2": {
//     //       "rich_text": [
//     //         {
//     //           "text": {
//     //             "content": "Lacinato kale"
//     //           }
//     //         }
//     //       ]
//     //     }
//     //   },
//     //   {
//     //     "object": "block",
//     //     "paragraph": {
//     //       "rich_text": [
//     //         {
//     //           "text": {
//     //             "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
//     //             "link": {
//     //               "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
//     //             }
//     //           },
//     //           "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
//     //         }
//     //       ],
//     //       "color": "default"
//     //     }
//     //   }
//     // ]
//   });

//   return json({response})
// }









// // EDIT A ROW
// // export const GET = async ({ request }) => {

// //   const response = await notion.pages.update({
// //     page_id: pageId,
// //     properties: {
// //       'Description': {
// //         "rich_text": [
// //           {
// //             "text": {
// //               "content": "A dark green leafy BANANA"
// //             }
// //           }
// //         ]
// //       },
// //     },
// //   });
 
// //   return json({ response })
// // }




// // DB FILTER QUERY
// export const GET = async ({ request }) => {

//   const response = await notion.databases.query({
//     database_id: dbId,
//     filter: {
//       property: "Name",
//       rich_text: {
//         equals: "Tuscan kale 123"
//       }
//     },
//   });

//   return json({ response })
// }




















export const GET = async ({ request }) => {

  let icon = "🍌";
  let cover = "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg";
  const data = {
    Name: "Banana",
    Description: "This is a description",
    completed: true, // Checkbox property
    meetingDate: { start: "2023-11-12", end: "2023-11-13" }, // Date property
    email: "example@example.com", // Email property
    attachments: ["https://example.com/file1.pdf", "https://example.com/file2.jpg"], // Files property
    tags: ["Urgent", "Client"], // Multi-select property
  };

  // optional - automatically pull it from the db or specify it manually
  let schema
  // schema = {
  //   Name: "title",
  //   Description: "rich_text",
  //   completed: "checkbox",
  //   meetingDate: "date",
  //   email: "email",
  //   attachments: "files",
  //   tags: "multi_select",
  //   score: "number",
  //   phoneNumber: "phone_number",
  //   category: "select",
  //   projectStatus: "status",
  //   website: "url"
  // };
  // schema = createSchemaFromResponse(await notion.databases.retrieve({ database_id: dbId }));
  const response = await notion.pages.create(await convertToNotionPageObject({ dbId, icon, cover, data, schema }));

  return json({ response })
}

