export const config = {
  // "loaders": {
  //   // "sourceFile": "../../../cytosis-data.json", // pull from this preloaded json file instad of fetching
  // },
  "transformers": ["outputObject"],
  "sources": [
    {
      "name": "jz-data",
      "type": "cfnotion",
      "path": "/collection/cccaab5d7ee04ebd9a42dbf2227c1cdb",
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
      "name": "jz-pages",
      "type": "cfnotion",
      "path": "/collection/c94e18d29ab54bdc8318d6a41f683e92",
      "loaders": {
        "notionPageId": "id"
      }
    },
  ]
}