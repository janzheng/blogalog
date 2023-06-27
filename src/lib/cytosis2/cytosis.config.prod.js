export const config = {
  // "loaders": {
  //   // "sourceFile": "../../../cytosis-data.json", // pull from this preloaded json file instad of fetching
  // },
  "transformers": [
    {
      "function": "outputObject",
      // "settings": {
      //   "flatten": true,
      //   "usePrefix": true,
      //   "divider": "__"
      // }
    },
  ],
  "sources": [
    {
      "name": "jz-data",
      "type": "cfnotion",
      "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
      // array-based transformation config
      "transformers": [
        {
          "function": "transformArrayToObjectByKey",
          "settings": {
            "objectKey": "Name"
          }
        }
      ]
    },
    {
      "name": "jz-posts",
      "type": "cfnotion",
      "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
      // "url": "https://notion-cloudflare-worker.yawnxyz.workers.dev",
      "loaders": {
        "notionPageId": "id" // loads the page data as well; this takes a lot of time + memory
      }
    },
  ]
}