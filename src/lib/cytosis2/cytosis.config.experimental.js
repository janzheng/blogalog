export const config = {
  // "loaders": {
  //   // "sourceFile": "../../../cytosis-data.json", // pull from this preloaded json file instad of fetching
  // },
  "transformers": [
    {
      "function": "outputObject", // default transformer that maps an array of sources to a keyed object
      // "settings": {
      //   "flatten": true,
      //   "usePrefix": true,
      //   "divider": "__"
      // }
    },
  ],
  "sources": [
    {
      "name": "data-example-text",
      "type": "data",
      "data": `{ \"text\": \"Sample JSON-lines string data here\" }
      { \"text\": \"Sample JSON-lines string data 2 here\" }`,
      "metadata": {
        "type": "text", // optionally add anything here
        "description": "just an example of json-lines"
      }
    },
    {
      "name": "data-example-object",
      "type": "data",
      "flat": true, // don't return with "data:"; removes metadata
      "data": {
        text: "Sample string data here"
      },
    },
    {
      "name": "data-example-array",
      "type": "data",
      "data": [
        "name, description",
        "str1, sample string 1",
        "str2, sample string 1",
      ],
      "metadata": {
        "description": "example of handling an array of csv text"
      } 
    },
  //   {
  //     "name": "site-data",
  //     "type": "cfnotion",
  //     "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
  //     // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
  //     // in-place transformation config
  //     // "transformer": {
  //     //   "remap": {
  //     //     "Name": "Fruit"
  //     //   },
  //     //   "objectKey": "Fruit", // --> use the new remapped name as the object key
  //     // },
  //     // array-based transformation config
  //     "transformers": [
  //       {
  //         "function": "transformArrayToObjectByKey",
  //         "settings": {
  //           "objectKey": "Name"
  //         }
  //       },
  //       {
  //         "function": "transformRemap",
  //         "settings": {
  //           "oneKeyDeep": true, // required when given an object w/ named keys like Airtable or ArrayToObject { key1: { ...data }}
  //           "remap": {
  //             "Name": "Fruit",
  //           }
  //         }
  //       },
  //     ]
  //   },
    // {
    //   "name": "site-pages",
    //   "type": "cfnotion",
    //   "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
    //   // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
    //   "loaders": {
    //     "notionPageId": "id" // loads the page data as well; this takes a lot of time + memory
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
    //     // {
    //     //   "function": "transformUnstructuredTextKeyArray",
    //     //   "settings": {
    //     //     "key": "Lede",
    //     //     "outputKey": "LedeSchema",
    //     //     "schema": "{foodItem, fruitItem}. Use Null if none found for foodItem or fruitItem."
    //     //   }
    //     // },
    //     // {
    //     //   "function": "llmArrayPrompt",
    //     //   "settings": {
    //     //     "key": "Lede",
    //     //     "outputKey": "PirateSummary",
    //     //     "prompt": "Content to Summarize content:",
    //     //     "llm": {
    //     //       "apiKeyName": "OPENAI_API_KEY",
    //     //       "system": "You are a helpful pirate assistant, who always speaks like a pirate. Instructions: Please summarize the lede like a pirate. Arr! Add a lot of ARrs because that's what pirates do. but with variations of capital and lowercase Rrs and a mix of AaaAAaArRrRrrrsS for fun. Also add pirate jokes and puns. Pirate jokes and puns are fun!",
    //     //       "modelName": "gpt-3.5-turbo"
    //     //     }
    //     //   }
    //     // },
    //   ]
    // },
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
    // },
    // {
    //   "name": "airfetch-test",
    //   "type": "airfetch",
    //   "settings": {
    //     "apiKeyName": "AIRTABLE_LINKS_API",
    //     "baseIdName": "AIRTABLE_LINKS_BASE",
    //   },
    //   "bases": [{
    //     "tables": ["Books [Entities]", "Attributes"],
    //     "options": {
    //       "view": "Grid view"
    //     }
    //   }],
    //   "transformers": [
    //     {
    //       "function": "transformFlattenKeyedObject",
    //     }
    //   ]
    // },
    // {
    //   "name": "airfetch-events-rollup-test",
    //   "type": "airfetch",
    //   "settings": {
    //     "apiKeyName": "AIRTABLE_LINKS_API",
    //     "baseIdName": "AIRTABLE_LINKS_BASE",
    //   },
    //   "bases": [{
    //     "tables": ["Events [Values]"],
    //     "options": {
    //       "view": "Grid view"
    //     }
    //   }],
    //   "transformers": [
    //     "transformFlattenKeyedObject", 
    //     "rollupEventsArrayToObjectByKey",
    //     "customLibraryEventTransformer"
    //   ]
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
    //     // "https://wikipedia.com",
    //   ],
    //   // "transformers": [
    //   //   {
    //   //     "function": "scrapeArray",
    //   //     "settings": {
    //   //       "key": "link",
    //   //       "outputKey": "content",
    //   //       "apiKeyName": "SCRAPING_BEE",
    //   //       "beeSettings": {
    //   //         //   premium_proxy: false,
    //   //         //   render_js: false,
    //   //         //   // extract_rules: `{"text":"body"}` // all text, no html
    //   //       }
    //   //     }
    //   //   },
    //   // ]
    // },
  ]
}