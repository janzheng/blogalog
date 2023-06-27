export const config = {
  "settings": {
    // "mode": "flat", // all named keys will be removed; all objects will be flattened into a single flat json obj
    // "sourceData": "../../../cytosis-data.json", // pull from this preloaded json file instad of fetching
  },
  "sources": [
    // {
    //   "name": "jz-posts",
    //   "type": "cfnotion",
    //   "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
    //   // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
    //   "loaders": {
    //     "notionPageId": "id" // loads the page data as well; this takes a lot of memory
    //   },
    //   "transformers": [
    //     {
    //       "function": "transformRemap",
    //       "settings": {
    //         "remap": {
    //           "Description": "Lede"
    //         }
    //       }
    //     },
    //   ]
    // },
    {
      "name": "jz-data",
      "type": "cfnotion",
      "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
      // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
      // in-place transformation config
      // "transformer": {
      //   "remap": {
      //     "Name": "Fruit"
      //   },
      //   "objectKey": "Fruit", // --> use the new remapped name as the object key
      // },
      // array-based transformation config
      "transformers": [
        {
          "function": "transformArrayToObjectByKey",
          "settings": {
            "objectKey": "Name"
          }
        },
        {
          "function": "transformRemap",
          "settings": {
            "oneKeyDeep": true, // required when given an object w/ named keys like Airtable or ArrayToObject { key1: { ...data }}
            "remap": {
              "Name": "Fruit",
            }
          }
        },
      ]
    },
    // {
    //   "name": "jz-post-page",
    //   "type": "cfnotion-pages",
    //   "path": "/page/adca4e5e5f2149b2be34c9087906407c",
    // },
    // {
    //   "name": "jz-post-pages",
    //   "type": "cfnotion-pages",
    //   "paths": [
    //     "/page/a8307b3892704898b42816e5f86cb349",
    //     "/page/7bfd7ca39fce47cea724b7beb09ab33f"
    //   ],
    //   settings: {
    //   }
    // },
    // {
    //   "name": "airfetch-test",
    //   "type": "airfetch",
    //   "settings": {
    //     "apiKeyName": "AIRTABLE_TEST_API",
    //     "baseIdName": "AIRTABLE_TEST_BASE",
    //   },
    //   "bases": [{
    //     "tables": ["Books [Entities]"],
    //     "options": {
    //       "view": "Grid view"
    //     }
    //   }]
    //   // map: {
    //   //   Name: "Fruit"
    //   // }
    // },
    // {
    //   "name": "bacteria",
    //   "type": "gsheet",
    //   "transformers": [
    //     {
    //       "function": "transformRemap",
    //       "settings": {
    //         "remap": {
    //           "Name": "Strain"
    //         }
    //       }
    //     },
    //     {
    //       "function": "transformArrayToObjectByKey",
    //       "settings": {
    //         "objectKey": "Strain"
    //       }
    //     }
    //   ],
    //   "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRuYa2r5lzHYSrU88gC4xnJyQzl9YA1VvUKvzmyvRJOA8PcEMfN085uWFvBsDzvZYeq-vOeJ_cZMGvm/pub?gid=281070310&single=true&output=csv"
    // },
    // {
    //   "name": "links-test",
    //   "type": "links",
    //   "paths": [
    //     "https://janzheng.com/",
    //     "https://wikipedia.com",
    //   ],
    // },
  ]
}