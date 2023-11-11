

// test page for notion-api 


// import { json } from '@sveltejs/kit';
// import { NOTION_API } from '$env/static/private';

// import { Client } from '@notionhq/client';
// const notion = new Client({ auth: NOTION_API });


// const dbid = "b05b399b60be45d9bf158ef4b44368c8"
// const pageId = "e973d4268b554dd59f8cbf99320ff629";



// // export const GET = async ({ request }) => {

// //   const response = await notion.pages.create({
// //     "cover": {
// //       "type": "external",
// //       "external": {
// //         "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
// //       }
// //     },
// //     "icon": {
// //       "type": "emoji",
// //       "emoji": "🥬"
// //     },
// //     "parent": {
// //       "type": "database_id",
// //       "database_id": dbid
// //     },
// //     "properties": {
// //       "Name": {
// //         "title": [
// //           {
// //             "text": {
// //               "content": "Tuscan kale 123"
// //             }
// //           }
// //         ]
// //       },
// //       "Description": {
// //         "rich_text": [
// //           {
// //             "text": {
// //               "content": "A dark green leafy vegetable"
// //             }
// //           }
// //         ]
// //       },
// //       "Food group": {
// //         "select": {
// //           "name": "🥬 Vegetable"
// //         }
// //       }
// //     },
// //     "children": [
// //       {
// //         "object": "block",
// //         "heading_2": {
// //           "rich_text": [
// //             {
// //               "text": {
// //                 "content": "Lacinato kale"
// //               }
// //             }
// //           ]
// //         }
// //       },
// //       {
// //         "object": "block",
// //         "paragraph": {
// //           "rich_text": [
// //             {
// //               "text": {
// //                 "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
// //                 "link": {
// //                   "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
// //                 }
// //               },
// //               "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
// //             }
// //           ],
// //           "color": "default"
// //         }
// //       }
// //     ]
// //   });

// //   return json({response})
// // }









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
//     database_id: dbid,
//     filter: {
//       property: "Name",
//       rich_text: {
//         equals: "Tuscan kale 123"
//       }
//     },
//   });

//   return json({ response })
// }
